FROM ruby:2.4
RUN gem install jekyll
COPY . /opt/app
WORKDIR  /opt/app
RUN bundle install
