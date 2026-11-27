CREATE DATABASE IF NOT EXISTS kb_workshop_test CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
CREATE DATABASE IF NOT EXISTS kb_workshop_eval CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
GRANT ALL PRIVILEGES ON kb_workshop_test.* TO 'workshop'@'%';
GRANT ALL PRIVILEGES ON kb_workshop_eval.* TO 'workshop'@'%';

-- Local Docker lab account. Use separately generated credentials outside the lab.
CREATE USER IF NOT EXISTS 'workshop_reader'@'%' IDENTIFIED BY 'workshop-reader-local';
GRANT SELECT ON kb_workshop.* TO 'workshop_reader'@'%';
GRANT SELECT ON kb_workshop_test.* TO 'workshop_reader'@'%';
