The following commands were used to setup / configure MySQL and create the web-server.js script 

1. Installed MySQL locally. 
2. Ran the following commands to setup the users table.
3. To test scipts ran localhost:3000/Login

mysql -u root -p

show databases;  

create database users; -- this is used to create the database the table resides in

use users;
drop table users;
create table users( id int(10) unsigned auto_increment primary key not null,username varchar(30) not null,email varchar(100) not null,password varchar(20) not null,accesslevel varchar(20) not null,created datetime not null,modified datetime not null);
 
describe users;

insert into users values ('100','admin','admin@okplate.com','admin','administrator', NOW(), NOW());
insert into users values ('200','guest','guest@okplate.com','guest','guest', NOW(), NOW());
commit;

select * from users;

\c

exit

select * from users where username = admin and password = admin;  used to test the script built in the js code.


----
