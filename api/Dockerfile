FROM centos:7

ENV NODE_ENV development

RUN mkdir /var/node
WORKDIR /var/node

RUN yum install -y gcc-c++ make sudo curl vim wget
RUN curl -sL https://rpm.nodesource.com/setup_12.x | sudo -E bash -
RUN yum install -y nodejs

RUN npm install -g nodemon
RUN npm install -g grunt-cli
RUN npm i - g grunt-express-server

CMD npm install && grunt