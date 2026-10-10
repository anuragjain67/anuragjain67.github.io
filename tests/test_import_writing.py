import importlib.util
from io import BytesIO
from email.message import Message
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile

spec = importlib.util.spec_from_file_location('import_writing', Path(__file__).parents[1] / 'tools/import_writing.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

FEED = '''<rss xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><item><title>A software note</title><link>https://jainanurag.medium.com/a-note-abc123</link><pubDate>Mon, 05 Jun 2023 12:30:00 +0530</pubDate><category>Software</category><content:encoded><![CDATA[<h2>Why?</h2><p onclick="bad()">Keep the words. {{ secrets }}<script>bad()</script><input><a href="javascript:bad()">Unsafe link</a></p>]]></content:encoded></item></channel></rss>'''


class ImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / '_posts').mkdir()
        self.feed = self.root / 'feed.xml'
        self.feed.write_text(FEED)

    def tearDown(self):
        self.temp.cleanup()

    def test_preview_does_not_write(self):
        report = module.import_stories(self.feed, self.root, 'Medium')
        self.assertEqual(report[0]['status'], 'preview')
        self.assertEqual(report[0]['date'], '2023-06-05T12:30:00+05:30')
        self.assertEqual(list((self.root / '_posts').iterdir()), [])

    def test_import_preserves_source_date_and_text_without_active_html_or_liquid(self):
        report = module.import_stories(self.feed, self.root, 'Medium', apply=True)
        text = (self.root / report[0]['post']).read_text()
        front, body = text.split('---', 2)[1:]
        fields = dict(line.split(': ', 1) for line in front.strip().splitlines())
        self.assertEqual(json.loads(fields['source_url']), 'https://jainanurag.medium.com/a-note-abc123')
        self.assertEqual(json.loads(fields['date']), '2023-06-05T12:30:00+05:30')
        self.assertIn('Keep the words.', body)
        self.assertIn('Unsafe link', body)
        self.assertNotIn('script', body)
        self.assertNotIn('onclick', body)
        self.assertNotIn('javascript:', body)
        self.assertNotIn('{{', body)

    def test_repeat_and_cross_post_do_not_duplicate_or_overwrite(self):
        first = module.import_stories(self.feed, self.root, 'Medium', apply=True)
        target = self.root / first[0]['post']
        original = target.read_bytes()
        self.feed.write_text(FEED.replace('https://jainanurag.medium.com/a-note-abc123', 'https://blog.anuragjain.me/different-url'))
        repeat = module.import_stories(self.feed, self.root, 'Blog', apply=True)
        self.assertIn('duplicate', repeat[0]['status'])
        self.assertEqual(target.read_bytes(), original)
        self.assertEqual(len(list((self.root / '_posts').iterdir())), 1)

    def test_summary_only_and_xml_entities_are_rejected(self):
        self.feed.write_text('<rss><channel><item><description>Summary</description></item></channel></rss>')
        with self.assertRaisesRegex(ValueError, 'summaries'):
            list(module.read_stories(self.feed))
        self.feed.write_text('<!DOCTYPE rss [<!ENTITY bad "expanded">]><rss/>')
        with self.assertRaisesRegex(ValueError, 'XML declarations'):
            list(module.read_stories(self.feed))

    def test_export_preserves_published_story_and_skips_draft(self):
        html = '''<html><head><meta charset="utf-8"></head><body><article><header><h1 class="p-name">Published story</h1></header><section data-field="body" class="e-content"><section><p>Words &amp; code.</p></section></section><footer><time class="dt-published" datetime="2024-01-02T10:00:00Z">Jan 2</time><a class="p-canonical" href="https://jainanurag.medium.com/published-123">Canonical link</a></footer></article></body></html>'''
        export = self.root / 'medium.zip'
        with zipfile.ZipFile(export, 'w') as archive:
            archive.writestr('posts/published.html', html)
            archive.writestr('posts/draft.html', '<h1 class="p-name">Draft</h1><section data-field="body"><p>Draft text</p></section>')
        stories = list(module.read_stories(export))
        self.assertEqual(len(stories), 1)
        self.assertEqual(stories[0]['title'], 'Published story')
        self.assertEqual(stories[0]['body'], '<section><p>Words &amp; code.</p></section>')

    def test_failed_image_fetch_leaves_post_unwritten(self):
        self.feed.write_text(FEED.replace('<h2>Why?</h2>', '<img src="https://miro.medium.com/test.png">'))
        with self.assertRaisesRegex(ValueError, 'download-images'):
            module.import_stories(self.feed, self.root, 'Medium', apply=True)
        with patch.object(module, 'urlopen', side_effect=OSError('blocked image host')):
            with self.assertRaises(OSError):
                module.import_stories(self.feed, self.root, 'Medium', apply=True, download_images=True)
        self.assertEqual(list((self.root / '_posts').iterdir()), [])
        self.assertFalse((self.root / 'assets').exists())

    def test_image_is_saved_locally_and_reference_is_rewritten(self):
        self.feed.write_text(FEED.replace('<h2>Why?</h2>', '<img src="https://miro.medium.com/test.png" alt="Diagram">'))
        from base64 import b64decode
        data = b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aB9sAAAAASUVORK5CYII=')
        response = BytesIO(data)
        response.headers = Message()
        response.headers['Content-Type'] = 'image/png'
        with patch.object(module, 'urlopen', return_value=response):
            report = module.import_stories(self.feed, self.root, 'Medium', apply=True, download_images=True)
        text = (self.root / report[0]['post']).read_text()
        self.assertIn('src="/assets/img/writing/', text)
        self.assertIn('alt="Diagram"', text)
        self.assertNotIn('https://miro.medium.com/test.png', text)
        assets = list((self.root / 'assets/img/writing').glob('*.png'))
        self.assertEqual(len(assets), 1)
        self.assertEqual(assets[0].read_bytes(), data)


if __name__ == '__main__':
    unittest.main()
