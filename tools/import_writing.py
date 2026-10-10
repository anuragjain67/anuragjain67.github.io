#!/usr/bin/env python3
"""Preview/import published stories from a full-content RSS feed or Medium export.
No third-party dependencies. Preview is the default; --apply writes new posts.
"""
import argparse
from datetime import datetime
from email.utils import parsedate_to_datetime
from html import escape, unescape
from html.parser import HTMLParser
import hashlib
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import urljoin, urlsplit
from urllib.request import urlopen
import xml.etree.ElementTree as ET
import zipfile

ALLOWED = set('p br hr h1 h2 h3 h4 h5 h6 ul ol li blockquote pre code strong em b i u s a img figure figcaption table thead tbody tr th td div span section sup sub'.split())
BLOCKED = set('script style iframe object embed form input button textarea select svg math'.split())
VOID = {'br', 'hr', 'img'}
HTML_VOID = VOID | {'input', 'meta', 'link', 'source', 'wbr', 'area', 'base', 'col', 'param', 'track'}


def key(value):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', value).casefold()).strip(' .?!')


def web_url(value):
    return urlsplit(value).scheme in ('http', 'https') and bool(urlsplit(value).hostname)


class CleanHTML(HTMLParser):
    def __init__(self, base):
        super().__init__(convert_charrefs=True)
        self.base, self.output, self.images, self.blocked = base, [], [], 0

    def handle_starttag(self, tag, attrs):
        if tag in BLOCKED and tag not in HTML_VOID:
            self.blocked += 1
        if self.blocked or tag in BLOCKED or tag not in ALLOWED:
            return
        clean = []
        for name, value in attrs:
            if value is None:
                continue
            if name in ('href', 'src'):
                if name == 'href' and value.startswith('#'):
                    target = value
                else:
                    target = urljoin(self.base, value)
                    if not web_url(target):
                        continue
                clean.append((name, target))
                if tag == 'img' and name == 'src':
                    self.images.append(target)
            elif name in ('alt', 'title', 'id', 'width', 'height', 'colspan', 'rowspan'):
                clean.append((name, value))
        self.output.append('<' + tag + ''.join(f' {n}="{escape(v, quote=True)}"' for n, v in clean) + '>')

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in BLOCKED:
            self.blocked = max(0, self.blocked - 1)
            return
        if not self.blocked and tag in ALLOWED and tag not in VOID:
            self.output.append('</' + tag + '>')

    def handle_data(self, value):
        if not self.blocked:
            self.output.append(escape(value))


class MediumHTML(HTMLParser):
    """Read only title, published timestamp, canonical URL, and story body."""
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.title, self.date, self.url, self.body = '', '', '', []
        self.depth, self.body_depth, self.title_depth = 0, None, None

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        classes = values.get('class', '').split()
        if tag not in HTML_VOID:
            self.depth += 1
        if 'p-name' in classes:
            self.title_depth = self.depth
        if 'dt-published' in classes:
            self.date = values.get('datetime', '')
        if 'p-canonical' in classes:
            self.url = values.get('href', '')
        if self.body_depth is not None:
            self.body.append(self.get_starttag_text())
        elif values.get('data-field') == 'body' or 'e-content' in classes:
            self.body_depth = self.depth

    def handle_endtag(self, tag):
        if self.body_depth is not None:
            if self.depth > self.body_depth:
                self.body.append('</' + tag + '>')
            elif self.depth == self.body_depth:
                self.body_depth = None
        if self.title_depth == self.depth:
            self.title_depth = None
        if tag not in HTML_VOID:
            self.depth -= 1

    def handle_data(self, value):
        if self.body_depth is not None:
            self.body.append(value)
        if self.title_depth is not None:
            self.title += value

    def handle_entityref(self, name):
        self.handle_data('&' + name + ';')

    def handle_charref(self, name):
        self.handle_data('&#' + name + ';')


def read_stories(path):
    if zipfile.is_zipfile(path):
        with zipfile.ZipFile(path) as archive:
            for info in archive.infolist():
                if '/posts/' not in '/' + info.filename or not info.filename.endswith('.html'):
                    continue
                if info.file_size > 10_000_000:
                    raise ValueError('Exported story exceeds 10 MB: ' + info.filename)
                parser = MediumHTML()
                parser.feed(archive.read(info).decode('utf-8'))
                # Drafts have no publication timestamp or canonical URL.
                if parser.date and parser.url:
                    yield {'title': unescape(parser.title), 'date': parser.date, 'url': parser.url,
                           'body': ''.join(parser.body), 'tags': []}
        return
    raw = path.read_bytes()
    if len(raw) > 20_000_000 or b'<!DOCTYPE' in raw.upper() or b'<!ENTITY' in raw.upper():
        raise ValueError('Feed is too large or contains unsupported XML declarations.')
    root = ET.fromstring(raw)
    if root.tag != 'rss':
        raise ValueError('Expected an RSS 2.0 full-content feed or Medium export ZIP.')
    for item in root.findall('./channel/item'):
        body = item.findtext('{http://purl.org/rss/1.0/modules/content/}encoded')
        if not body:
            raise ValueError('RSS contains summaries only; a full-content feed or export is required.')
        yield {'title': item.findtext('title', ''), 'date': item.findtext('pubDate', ''),
               'url': item.findtext('link', ''), 'body': body,
               'tags': [tag.text for tag in item.findall('category') if tag.text]}


def date_of(value):
    try:
        date = datetime.fromisoformat(value.replace('Z', '+00:00'))
    except ValueError:
        date = parsedate_to_datetime(value)
    if date.tzinfo is None:
        raise ValueError('Publication date requires a timezone.')
    return date


def import_stories(path, repo, platform, apply=False, download_images=False):
    posts = repo / '_posts'
    existing = set()
    # YAML title and source_url lines, including JSON-quoted values this tool writes.
    for post in posts.glob('*'):
        for line in post.read_text().split('---', 2)[1].splitlines():
            if line.startswith(('title:', 'source_url:')):
                value = line.split(':', 1)[1].strip()
                if value.startswith('"'):
                    try:
                        value = json.loads(value)
                    except json.JSONDecodeError:
                        pass
                existing.add(key(value.strip("'")))
    report = []
    for story in read_stories(path):
        if not story['title'] or not story['body'] or not web_url(story['url']):
            raise ValueError('Story requires a title, full body, and public source URL.')
        if key(story['url']) in existing or key(story['title']) in existing:
            report.append({'title': story['title'], 'status': 'duplicate; unchanged'})
            continue
        date = date_of(story['date'])
        slug = re.sub(r'[^a-z0-9]+', '-', unicodedata.normalize('NFKD', story['title']).encode('ascii', 'ignore').decode().lower()).strip('-')[:90] or 'story'
        slug += '-' + hashlib.sha256(story['url'].encode()).hexdigest()[:8]
        target = posts / (date.strftime('%Y-%m-%d-') + slug + '.html')
        if target.exists():
            raise ValueError('Refusing to overwrite: ' + str(target))
        cleaner = CleanHTML(story['url'])
        cleaner.feed(story['body'])
        body = ''.join(cleaner.output)
        pending_assets = []
        if apply and cleaner.images and not download_images:
            raise ValueError('Images require --download-images before applying this import.')
        if apply:
            # Fetch all images before writing this story. Failed fetches leave no partial post.
            for url in sorted(set(cleaner.images)):
                with urlopen(url, timeout=30) as response:
                    mime = response.headers.get_content_type()
                    ext = {'image/png': '.png', 'image/jpeg': '.jpg', 'image/webp': '.webp', 'image/gif': '.gif'}.get(mime)
                    if not ext:
                        raise ValueError('Unsupported image type: ' + mime)
                    data = response.read(20_000_001)
                    if len(data) > 20_000_000:
                        raise ValueError('Image exceeds 20 MB.')
                relative = '/assets/img/writing/' + hashlib.sha256(data).hexdigest()[:24] + ext
                body = body.replace(escape(url, quote=True), relative)
                pending_assets.append((repo / relative.lstrip('/'), data))
            for asset, data in pending_assets:
                asset.parent.mkdir(parents=True, exist_ok=True)
                asset.write_bytes(data)
            metadata = {'layout': 'post', 'title': story['title'], 'date': date.isoformat(),
                        'tags': story['tags'], 'source_platform': platform, 'source_url': story['url']}
            # Encode braces so imported text cannot execute Jekyll Liquid instructions.
            body = body.replace('{', '&#123;').replace('}', '&#125;')
            front = '\n'.join(name + ': ' + json.dumps(value, ensure_ascii=False) for name, value in metadata.items())
            target.write_text('---\n' + front + '\n---\n' + body + '\n')
        existing.update((key(story['title']), key(story['url'])))
        report.append({'title': story['title'], 'date': date.isoformat(), 'source_url': story['url'],
                       'post': str(target.relative_to(repo)), 'images': len(set(cleaner.images)),
                       'status': 'imported' if apply else 'preview'})
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--platform', required=True, choices=['Medium', 'Blog'])
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--download-images', action='store_true')
    args = parser.parse_args()
    try:
        report = import_stories(args.source, args.repo, args.platform, args.apply, args.download_images)
    except (ValueError, OSError, ET.ParseError) as error:
        parser.exit(1, str(error) + '\n')
    print(json.dumps(report, indent=2, ensure_ascii=False))
