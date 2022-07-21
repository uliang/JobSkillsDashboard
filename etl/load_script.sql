CREATE SCHEMA if not exists bgt_staging
	default character set utf8mb4
    default collate utf8mb4_0900_ai_ci; 
    
USE bgt_staging; 

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS sector_table; 
DROP TABLE IF EXISTS bgtocc_table; 
DROP TABLE IF EXISTS skill_table; 
DROP TABLE IF EXISTS skill_description_table;
DROP TABLE IF EXISTS top_bgtoccs_table; 
DROP TABLE IF EXISTS bgtocc_description_table; 
DROP TABLE IF EXISTS education_table; 
DROP TABLE IF EXISTS employer_table; 

SET FOREIGN_KEY_CHECKS=1; 

CREATE TABLE IF NOT EXISTS sector_table (
    id                      int not null primary key, 
    sector                  varchar(20) not null, 

    index (sector)
);
LOAD DATA 
    local infile './table_files/sector_table.csv' 
    replace
    into table sector_table
    fields terminated by ',' optionally enclosed by '"'
    lines terminated by '\n' 
    ignore 1 lines; 


CREATE TABLE IF NOT EXISTS bgtocc_table (
    bgtocc                  varchar(200) not null,  
    country 				varchar(20), 
    bgtocc_name_hash        varchar(50), 
    job_postings 		    integer, 
    period 					varchar(50), 
    sector 					varchar(50) not null,
    `index` 				varchar(50)  not null primary key,
    `year` 					integer,

    foreign key (sector) 
    references
        sector_table(sector)
    on update cascade
    ); 
LOAD DATA   
    local infile './table_files/bgtocc_table.csv'
    replace 
    into table bgtocc_table
    fields terminated by ',' optionally enclosed by '"'
    lines terminated by '\n' 
    ignore 1 lines; 

CREATE TABLE IF NOT EXISTS bgtocc_description_table (
    id                      integer not null primary key, 
    bgtocc                  varchar(100), 
    bgtocc_hash             varchar(50),
    description             text, 

    index (bgtocc_hash)    
);
LOAD DATA 
    local infile './table_files/bgtocc_description_table.csv'
    replace 
    into table bgtocc_description_table
    fields terminated by ',' optionally enclosed by '"'
    lines terminated by '\n' 
    ignore 1 lines; 

CREATE TABLE IF NOT EXISTS top_bgtoccs_table (
    id                      integer primary key, 
    bgtocc                  varchar(100), 
    bgtocc_hash             varchar(50), 
    country                 varchar(20), 
    job_postings            integer, 
    period                  varchar(50), 
    sector                  varchar(20), 
    `year`                  integer, 
    
    -- index (bgtocc_hash), 

    foreign key (sector) 
    references
        sector_table(sector)
    on update cascade,

    foreign key (bgtocc_hash)
    references bgtocc_description_table (bgtocc_hash) 
    on update cascade
);
LOAD DATA   
    local infile './table_files/top_bgtoccs_table.csv'
    replace 
    into table top_bgtoccs_table
    fields terminated by ',' optionally enclosed by '"'
    lines terminated by '\n' 
    ignore 1 lines; 

CREATE TABLE IF NOT EXISTS skill_description_table (
    id                      integer not null primary key,
    skill_name                  varchar(100), 
    `Description`           text, 
    skill_name_hash         varchar(50) unique,

    index(skill_name_hash)
    
); 
LOAD DATA 
    local infile './table_files/skill_description_table.csv'
    replace 
    into table skill_description_table
    fields terminated by ',' optionally enclosed by '"'
    lines terminated by '\n' 
    ignore 1 lines; 


DROP TABLE IF EXISTS skill_table; 
CREATE TABLE IF NOT EXISTS skill_table (
    id 						integer primary key, 
    bgtocc_index 			varchar(50) not null, 
    skill_name 				varchar(100) not null, 
    skill_type 				varchar(20), 
    skill_name_hash         varchar(50), 
    job_postings            integer, 
    
    -- index (skill_name_hash), 

    foreign key (bgtocc_index) 
	references 
		bgtocc_table (`index`) 
	on delete cascade
    on update cascade,

    foreign key (skill_name_hash) 
    references skill_description_table (skill_name_hash) 
    on update cascade 
); 
LOAD DATA 
    local infile './table_files/skill_table.csv'
    replace 
    into table skill_table
    fields terminated by ',' optionally enclosed by '"'
    lines terminated by '\n' 
    ignore 1 lines; 



CREATE TABLE IF NOT EXISTS education_table (
    id                      integer not null primary key, 
    Experience              varchar(50), 
    Education               varchar(50), 
    num_of_jobs             integer, 
    period                  varchar(50), 
    country                 varchar(20), 
    sector                  varchar(20) not null, 
    `year`                  integer , 
    
    foreign key (sector) 
    references 
        sector_table (sector)
    on update cascade  
); 
LOAD DATA 
    local infile './table_files/education_table.csv'
    replace 
    into table education_table
    fields terminated by ',' optionally enclosed by '"'
    lines terminated by '\n' 
    ignore 1 lines; 


CREATE TABLE IF NOT EXISTS employer_table (
    id                      integer not null primary key ,
    Employer                varchar(250), 
    `Job Postings`          integer, 
    period                  varchar(50), 
    country                 varchar(20), 
    sector                  varchar(20) not null, 
    `year`                  integer, 
    
    foreign key (sector) 
    references 
        sector_table (sector)
    on update cascade  
); 
LOAD DATA 
    local infile './table_files/employer_table.csv'
    replace 
    into table employer_table
    fields terminated by ',' optionally enclosed by '"'
    lines terminated by '\n' 
    ignore 1 lines; 

