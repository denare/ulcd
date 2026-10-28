-- Migration 013: Demo seed data — UDOM CIVE courses and programmes
-- ============================================================
-- IMPORTANT: This is DEMONSTRATION DATA only.
-- - No real lecturer names, phone numbers, or email addresses are included.
-- - Course data is derived from publicly available UDOM programme handbooks.
-- - No fictional contact information is presented as verified real data.
-- ============================================================

-- ============================================================
-- CIVE SCHOOL
-- ============================================================
INSERT INTO schools (institution_id, name, slug)
SELECT i.id, 'College of Informatics and Virtual Education', 'cive'
FROM institutions i WHERE i.slug = 'udom';

-- ============================================================
-- CIVE DEPARTMENTS
-- ============================================================
WITH cive AS (
  SELECT s.id AS school_id, i.id AS institution_id
  FROM schools s
  JOIN institutions i ON i.id = s.institution_id
  WHERE s.slug = 'cive' AND i.slug = 'udom'
)
INSERT INTO departments (institution_id, school_id, name, slug, description)
SELECT
  cive.institution_id,
  cive.school_id,
  dept.name,
  dept.slug,
  dept.description
FROM cive, (VALUES
  ('Computer Science and Software Engineering', 'cs-se',
   'Offers BSc in Computer Science and BSc in Software Engineering'),
  ('Computer Networks and Information Security', 'cn-is',
   'Offers BSc in Computer Networks and Information Security Engineering, and BSc in Cyber Security and Digital Forensics Engineering'),
  ('Computer Engineering', 'ce',
   'Offers BSc in Computer Engineering and BSc in Telecommunications Engineering'),
  ('Information Systems and Business Informatics', 'is-bi',
   'Offers BSc in Information Systems and BSc in Business Information Systems'),
  ('Digital Content and Instructional Design', 'dcid',
   'Offers BSc in Instructional Design and IT, BSc in Multimedia Technology and Animation, and BSc in Digital Content and Broadcasting Engineering')
) AS dept(name, slug, description);

-- ============================================================
-- COURSES — BSc CNISE (Computer Networks & Information Security Eng.)
-- ============================================================
WITH udom AS (SELECT id FROM institutions WHERE slug = 'udom'),
     dept AS (SELECT d.id FROM departments d WHERE d.slug = 'cn-is')
INSERT INTO courses (institution_id, department_id, course_code, course_name, is_active)
SELECT udom.id, dept.id, c.code, c.name, TRUE
FROM udom, dept, (VALUES
  -- Year 1 Sem 1
  ('LG 102', 'Communication Skills'),
  ('TN 113', 'Calculus'),
  ('CP 111', 'Principles of Programming Languages'),
  ('TN 111', 'Discrete Mathematics for ICT'),
  ('DS 102', 'Development Perspectives'),
  ('IT 111', 'Introduction to Information Technology'),
  ('TN 112', 'Linear Algebra for ICT'),
  ('IA 112', 'Mathematical Foundations of Information Security'),
  -- Year 1 Sem 2
  ('TN 122', 'Introduction to Probability and Statistics'),
  ('CS 123', 'Introduction to Software Engineering'),
  ('IA 123', 'Principles of Security'),
  ('CP 121', 'Introduction to Database Systems'),
  ('CN 121', 'Introduction to Computer Networking'),
  ('IA 222', 'Cryptography'),
  ('CG 121', 'Wearable Computing'),
  ('CP 123', 'Introduction to High Level Programming'),
  -- Year 2 Sem 1
  ('CP 215', 'Object Oriented Programming in Java'),
  ('CP 213', 'Data Structures and Algorithms Analysis'),
  ('IA 211', 'Information Security Technologies'),
  ('CN 211', 'Computer Networking Protocols'),
  ('CT 211', 'Computer Organization and Architecture I'),
  ('CP 212', 'Systems Analysis and Design'),
  ('CP 211', 'Introduction to Linux/Unix Systems'),
  -- Year 2 Sem 2
  ('CP 224', 'Database Management Systems'),
  ('CP 221', 'Internet Programming and Application I'),
  ('CP 226', 'Operating Systems'),
  ('IS 221', 'ICT Research Methods'),
  ('CN 221', 'Networking Routers and Routing Protocols'),
  ('IA 221', 'Network Security'),
  -- Year 3 Sem 1
  ('IA 313', 'Operating Systems Security'),
  ('CP 311', 'Internet Programming and Applications II'),
  ('IA 311', 'Network Forensics'),
  ('IA 418', 'Cyber Criminology and Techniques'),
  ('CP 312', 'Python Programming'),
  ('CP 314', 'Distributed Computing'),
  ('IA 315', 'Information Security Auditing and Assurance'),
  ('IA 314', 'Biometric Security'),
  ('CG 311', 'Fundamentals of Software Defined Networks'),
  -- Year 3 Sem 2
  ('IA 325', 'Security and Fault-Tolerance in Distributed Systems'),
  ('IA 421', 'Business Continuity and Disaster Recovery'),
  ('IA 322', 'Malware and Software Vulnerability Analysis'),
  ('IA 324', 'Web and Mobile Systems Security'),
  ('IA 321', 'Information and Communication Systems Security'),
  ('IA 326', 'Secure Systems Development'),
  ('CS 427', 'Semantic Web and Social Networks'),
  ('CG 322', 'Blockchain Technology'),
  -- Year 4 Sem 1
  ('EME 314', 'ICT Entrepreneurship'),
  ('SI 311', 'Professional Ethics and Conduct'),
  ('IA 414', 'Database Security'),
  ('BT 413', 'ICT Project Management'),
  ('IA 416', 'Cloud Computing Security'),
  ('CN 411', 'Wireless Networks and Mobile Computing'),
  ('IA 415', 'Information Security Management and Standards'),
  ('IA 417', 'Cyber Threat Intelligence'),
  -- Year 4 Sem 2
  ('CP 423', 'Systems Administration and Management'),
  ('IA 422', 'Ethical Hacking'),
  ('IA 428', 'Trust Management in E-Commerce'),
  ('IA 423', 'Wireless Security'),
  ('CP 422', 'Artificial Intelligence'),
  ('IA 424', 'Selected Topics in Computer Networks and Information Security Engineering'),
  ('CP 421', 'Digital Image Processing')
) AS c(code, name)
ON CONFLICT (institution_id, course_code) DO NOTHING;

-- ============================================================
-- COURSES — BSc CE (Computer Engineering)
-- ============================================================
WITH udom AS (SELECT id FROM institutions WHERE slug = 'udom'),
     dept AS (SELECT d.id FROM departments d WHERE d.slug = 'ce')
INSERT INTO courses (institution_id, department_id, course_code, course_name, is_active)
SELECT udom.id, dept.id, c.code, c.name, TRUE
FROM udom, dept, (VALUES
  ('CT 111', 'Fundamentals of Engineering Drawing with CAD'),
  ('EC 111', 'Fundamentals of Electrical Engineering'),
  ('CT 122', 'Introduction to Computer Engineering'),
  ('CT 121', 'Introduction to Electronics Engineering'),
  ('IA 124', 'Introduction to IT Security'),
  ('EC 212', 'Measurements and Instrumentation Engineering'),
  ('TN 211', 'Calculus for Engineers'),
  ('CT 212', 'Analogue Electronics'),
  ('CT 222', 'Hardware Description Languages and Programmable Logic'),
  ('CT 221', 'Digital Electronics'),
  ('TN 223', 'Signals and Systems'),
  ('CT 312', 'Computer Maintenance'),
  ('CT 314', 'Computer Organization and Architecture II'),
  ('CT 315', 'Mobile Computing'),
  ('CT 313', 'Very Large-Scale Integrated Circuits'),
  ('CT 311', 'Microprocessor and Interfacing'),
  ('EC 211', 'Electrical Networks Analysis'),
  ('TN 312', 'Optical Communication Systems'),
  ('CT 321', 'Microcontroller Systems'),
  ('CP 321', 'Distributed Database Systems'),
  ('CT 322', 'Robotics and Automation'),
  ('CN 322', 'LAN Switching'),
  ('CG 221', 'Fundamentals of IoT'),
  ('CT 411', 'Embedded Systems I'),
  ('CT 412', 'Parallel Computing'),
  ('TN 412', 'Digital Signal Processing'),
  ('BT 413', 'ICT Project Management'),
  ('CT 413', 'Operating Systems Internals'),
  ('CP 324', 'Compiler Technology'),
  ('CT 421', 'Embedded Systems II'),
  ('CP 322', 'Data Mining and Warehousing'),
  ('CG 411', 'Computer Engineering Project I'),
  ('CG 421', 'Computer Engineering Project II'),
  ('CG 422', 'Selected Topics in Computer Engineering')
) AS c(code, name)
ON CONFLICT (institution_id, course_code) DO NOTHING;

-- ============================================================
-- COURSES — BSc CS (Computer Science)
-- ============================================================
WITH udom AS (SELECT id FROM institutions WHERE slug = 'udom'),
     dept AS (SELECT d.id FROM departments d WHERE d.slug = 'cs-se')
INSERT INTO courses (institution_id, department_id, course_code, course_name, is_active)
SELECT udom.id, dept.id, c.code, c.name, TRUE
FROM udom, dept, (VALUES
  ('TN 121', 'Numerical Analysis for ICT'),
  ('CP 214', 'Computational Theory'),
  ('CS 215', 'Selected Topics in Computer Science'),
  ('CP 222', 'Open-Source Technologies'),
  ('CP 223', 'Object-Oriented Systems Design'),
  ('CG 222', 'Foundations of Data Science'),
  ('CP 313', 'Mobile Applications Development'),
  ('CS 319', 'Computer Science Project I'),
  ('TN 316', 'Mathematical Logic and Formal Semantics'),
  ('CP 318', 'Computer Graphics'),
  ('IM 411', 'Human-Computer Interaction'),
  ('CS 339', 'Computer Science Project II'),
  ('CP 323', 'Web Framework Development Using JavaScript'),
  ('CP 424', 'Cloud Computing'),
  ('CS 431', 'Software Engineering Project I'),
  ('CS 432', 'Software Engineering Project II'),
  ('CP 412', 'Programming'),
  ('CS 411', 'Software Reverse Engineering'),
  ('BT 312', 'Electronic and Mobile Commerce'),
  ('CD 312', 'Multimedia Content Development'),
  ('CS 421', 'Software Deployment and Management'),
  ('CS 329', 'Big Data Analysis'),
  ('CS 321', 'Advanced Java Programming'),
  ('CP 225', 'Software Testing and Quality Assurance'),
  ('CP 316', 'Selected Topics in Software Engineering'),
  ('CP 416', 'Human-Computer Interaction')
) AS c(code, name)
ON CONFLICT (institution_id, course_code) DO NOTHING;

-- ============================================================
-- COURSES — BSc IS (Information Systems) + BSc BIS
-- ============================================================
WITH udom AS (SELECT id FROM institutions WHERE slug = 'udom'),
     dept AS (SELECT d.id FROM departments d WHERE d.slug = 'is-bi')
INSERT INTO courses (institution_id, department_id, course_code, course_name, is_active)
SELECT udom.id, dept.id, c.code, c.name, TRUE
FROM udom, dept, (VALUES
  ('IM 111', 'Introduction to Information Systems'),
  ('MG 111', 'Principles of Business'),
  ('AF 111', 'Introduction to Financial Accounting'),
  ('MS 123', 'Procurement Management'),
  ('IS 138', 'Industrial Practical Training I'),
  ('BT 211', 'Computerized Accounting Applications'),
  ('AM 113', 'Business Mathematics'),
  ('LW 2108', 'Business Law and Corporate Governance'),
  ('EMM 111', 'Principles of Marketing'),
  ('BT 212', 'E-Business Strategy, Architecture and Designing'),
  ('MS 217', 'Clearing and Forwarding Management'),
  ('IS 214', 'Decision and Executive Support Systems'),
  ('IM 221', 'SCM Information Systems'),
  ('EMM 224', 'E-Marketing'),
  ('IS 238', 'Industrial Practical Training II'),
  ('IM 311', 'Customer Relationship Management Information System'),
  ('IS 315', 'Business Information Systems Project I'),
  ('IM 314', 'Business Intelligence System and Data Visualization'),
  ('IM 326', 'Knowledge Management Systems'),
  ('IM 325', 'Management Information System'),
  ('LW 3208', 'ICT Laws and Ethics'),
  ('IS 328', 'Geographic Information Systems'),
  ('IM 323', 'Business Analytics – Principles and Applications'),
  ('MS 324', 'Inventory Management'),
  ('MG 323', 'Import and Export Management'),
  ('IS 324', 'Business Information Systems Project II'),
  ('IM 329', 'Selected Topics in Business Information Systems'),
  ('TN 324', 'Statistics for Information Analysis'),
  ('IS 112', 'ICT for Development'),
  ('MG 121', 'Principles and Practice of Management'),
  ('IM 218', 'Information Systems Strategies'),
  ('IS 213', 'E-Government Information System: Design and Implementation'),
  ('MS 211', 'Operation Research for Business Decision'),
  ('IM 223', 'Design and Management of Enterprise Systems'),
  ('MG 221', 'Organizational Behavior'),
  ('MG 316', 'Organizational Risk Management'),
  ('IS 316', 'Information Systems Project I'),
  ('IS 326', 'Information Systems Project II'),
  ('IM 327', 'Computer Supported Collaborative Work'),
  ('HR 322', 'Organizational Change and Development'),
  ('IS 322', 'Information Systems Competences'),
  ('IM 313', 'Principle of Big Data Management'),
  ('IS 318', 'E-Agriculture and Environment'),
  ('MG 311', 'Strategic Management'),
  ('IM 324', 'Selected Topics in Information Systems'),
  ('IS 321', 'Information Systems Theories'),
  ('AF 221', 'Auditing Principles and Practice'),
  ('IM 211', 'Business Information Systems'),
  ('PO 113', 'Government and Politics in Tanzania'),
  ('AF 312', 'Public Finance and Taxation I'),
  ('HI 213', 'E-Health')
) AS c(code, name)
ON CONFLICT (institution_id, course_code) DO NOTHING;

-- ============================================================
-- COURSES — Digital Content, IDIT, MTA, DCBE
-- ============================================================
WITH udom AS (SELECT id FROM institutions WHERE slug = 'udom'),
     dept AS (SELECT d.id FROM departments d WHERE d.slug = 'dcid')
INSERT INTO courses (institution_id, department_id, course_code, course_name, is_active)
SELECT udom.id, dept.id, c.code, c.name, TRUE
FROM udom, dept, (VALUES
  ('ET 111', 'Introduction to Educational Technology'),
  ('CD 112', 'Foundations of Instructional Design'),
  ('CD 111', 'Digital Media Psychology'),
  ('CD 121', 'Desktop Publishing'),
  ('CD 122', 'Multimedia Technology I'),
  ('CD 131', 'Industrial Training I'),
  ('CD 212', 'Games Development'),
  ('ET 213', 'Technology Management, Integration and Leadership'),
  ('CD 213', 'Graphics Design Tools'),
  ('CD 215', 'Digital Instructional Design I'),
  ('CD 222', 'Digital Audio-Video Production'),
  ('CD 223', 'Digital Sound-Video Editing'),
  ('CD 221', 'Fundamentals of 2D Animation'),
  ('CD 231', 'Industrial Training II'),
  ('CD 327', 'Learning Management Systems'),
  ('ET 221', 'Distance Learning'),
  ('CD 311', '3D Modelling and Rendering'),
  ('CD 314', 'Digital Instructional Design II'),
  ('CD 332', 'IDIT Project I'),
  ('CD 333', 'IDIT Project II'),
  ('CD 322', 'Digital Creative Advertising and Production'),
  ('CD 321', '3D Animations and Special Effects'),
  ('CD 323', 'Electronic Media Publishing'),
  ('ET 322', 'Advanced Technology for Education and Training'),
  ('CD 328', 'Multimedia Technology II'),
  ('CD 324', 'Selected Topics in Instructional Design and Information Technology'),
  ('CD 331', 'MTA Project I'),
  ('CD 334', 'MTA Project II'),
  ('AD 326', 'Practices in Photography'),
  ('CD 325', 'Digital Broadcasting Engineering'),
  ('CD 329', 'Selected Topics in Multimedia Technology and Animation'),
  ('CD 113', 'Fundamentals of Content Engineering'),
  ('CN 111', 'Introduction to Telecommunications Engineering'),
  ('CD 214', 'Broadcast Facility Maintenance'),
  ('CD 217', 'Broadcasting Systems Engineering'),
  ('CD 224', 'Broadcasting Systems Integration I'),
  ('CD 225', 'Video and Audio Systems I'),
  ('CD 313', 'Digital Recording Engineering'),
  ('CD 315', 'Synthesis and Computer Based Audio Engineering'),
  ('CD 326', 'Analogue and High-Definition Television'),
  ('CD 431', 'Content Engineering Project I'),
  ('CD 411', 'Project Studio Production and Sound Synthesis'),
  ('CD 412', 'Video and Audio Systems II'),
  ('SI 312', 'Organizational Management'),
  ('LW 4110', 'Legal Aspects in Cyber Security'),
  ('TN 422', 'Satellite Communications'),
  ('CD 432', 'Content Engineering Project II'),
  ('CD 421', 'Advanced Multimedia Infrastructure'),
  ('TN 423', 'Television Systems'),
  ('CD 423', 'Broadcasting Systems Integration II'),
  ('CD 424', 'Selected Topics in Content Engineering'),
  ('TF 211', 'Writing for Screen'),
  ('CS 313', 'Mobile Applications Development in Education'),
  ('CS 418', 'Cyber Security and Digital Forensics Engineering Project I'),
  ('CS 428', 'Cyber Security and Digital Forensics Engineering Project II'),
  ('IA 429', 'Information Systems Forensics Internal Auditing')
) AS c(code, name)
ON CONFLICT (institution_id, course_code) DO NOTHING;

-- ============================================================
-- COURSES — BSc TE (Telecommunications Engineering)
-- ============================================================
WITH udom AS (SELECT id FROM institutions WHERE slug = 'udom'),
     dept AS (SELECT d.id FROM departments d WHERE d.slug = 'ce')
INSERT INTO courses (institution_id, department_id, course_code, course_name, is_active)
SELECT udom.id, dept.id, c.code, c.name, TRUE
FROM udom, dept, (VALUES
  ('TN 311', 'Analogue Telecommunications'),
  ('CN 311', 'Wireless Networking'),
  ('TN 314', 'Electromagnetic Theory II'),
  ('EC 311', 'Intelligent Instrumentation'),
  ('TN 315', 'Selected Topics in Telecommunication Engineering'),
  ('TN 321', 'Fuzzy Logic for Engineering Application'),
  ('TN 322', 'Microwave Engineering'),
  ('TN 323', 'Digital Telecommunications'),
  ('CN 321', 'Tele-traffic Engineering'),
  ('TN 411', 'Mobile Communication'),
  ('TN 413', 'Information Theory and Coding'),
  ('TN 431', 'Telecommunications Engineering Project I'),
  ('TN 432', 'Telecommunications Engineering Project II'),
  ('CN 421', 'Telecommunication Switching and Transmission Systems'),
  ('CN 422', 'WAN Technologies'),
  ('IA 425', 'Legal Aspects of Information Security'),
  ('TN 225', 'Electromagnetic Theory I'),
  ('TN 231', 'Industrial Practical Training II'),
  ('EC 221', 'Classical Control Systems Engineering')
) AS c(code, name)
ON CONFLICT (institution_id, course_code) DO NOTHING;

-- ============================================================
-- COURSES — BSc CSDFE (additional unique courses)
-- ============================================================
WITH udom AS (SELECT id FROM institutions WHERE slug = 'udom'),
     dept AS (SELECT d.id FROM departments d WHERE d.slug = 'cn-is')
INSERT INTO courses (institution_id, department_id, course_code, course_name, is_active)
SELECT udom.id, dept.id, c.code, c.name, TRUE
FROM udom, dept, (VALUES
  ('IA 111', 'Introduction to Computer Forensics'),
  ('IA 121', 'Foundations of Cyber Security'),
  ('IA 212', 'Computer Forensics and Investigation'),
  ('IA 318', 'IT Security Metrics'),
  ('IA 312', 'Multimedia Forensics'),
  ('IA 316', 'Mobile Forensics Analysis'),
  ('IA 317', 'Selected Topics in Cyber Security and Digital Forensics Engineering'),
  ('CP 325', 'Assembly Language Programming'),
  ('LW 4110', 'Legal Aspects in Cyber Security'),
  ('IA 429', 'Information Systems Forensics Internal Auditing')
) AS c(code, name)
ON CONFLICT (institution_id, course_code) DO NOTHING;

-- ============================================================
-- INDUSTRIAL PRACTICAL TRAINING COURSES (shared)
-- ============================================================
WITH udom AS (SELECT id FROM institutions WHERE slug = 'udom')
INSERT INTO courses (institution_id, course_code, course_name, is_active)
SELECT udom.id, c.code, c.name, TRUE
FROM udom, (VALUES
  ('CS 131', 'Industrial Practical Training I'),
  ('CS 231', 'Industrial Practical Training II'),
  ('CS 331', 'Industrial Practical Training III'),
  ('CG 131', 'Industrial Practical Training I (CE)'),
  ('CG 231', 'Industrial Practical Training II (CE)'),
  ('CG 331', 'Industrial Practical Training III (CE)'),
  ('IS 138', 'Industrial Practical Training I (IS/BIS)'),
  ('TN 131', 'Industrial Training I (TE)')
) AS c(code, name)
ON CONFLICT (institution_id, course_code) DO NOTHING;

-- ============================================================
-- NOTE: No lecturer records or contact information seeded here.
-- Lecturer profiles must be created by authorized administrators.
-- All contact data requires verification before publication.
-- This seed file provides only institutional structure and course catalogue.
-- ============================================================
