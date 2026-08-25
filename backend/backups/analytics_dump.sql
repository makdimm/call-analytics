--
-- PostgreSQL database dump
--

\restrict CYUWW8mrQgvWAwv6XthhLw4bgsr3QKJmMtjFbe1d7ZDDhFb4ckD2FS0B6QxpYMd

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.sales_campaigns DROP CONSTRAINT IF EXISTS sales_campaigns_script_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_campaign_contacts DROP CONSTRAINT IF EXISTS sales_campaign_contacts_contact_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_campaign_contacts DROP CONSTRAINT IF EXISTS sales_campaign_contacts_campaign_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_calls DROP CONSTRAINT IF EXISTS sales_calls_contact_id_fkey;
ALTER TABLE IF EXISTS ONLY public.sales_calls DROP CONSTRAINT IF EXISTS sales_calls_campaign_id_fkey;
ALTER TABLE IF EXISTS ONLY public.calls DROP CONSTRAINT IF EXISTS calls_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.call_type_criteria DROP CONSTRAINT IF EXISTS call_type_criteria_criteria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.call_criteria_scores DROP CONSTRAINT IF EXISTS call_criteria_scores_criteria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.call_criteria_scores DROP CONSTRAINT IF EXISTS call_criteria_scores_call_id_fkey;
DROP INDEX IF EXISTS public.ix_users_username;
DROP INDEX IF EXISTS public.ix_users_id;
DROP INDEX IF EXISTS public.ix_users_email;
DROP INDEX IF EXISTS public.ix_sales_scripts_id;
DROP INDEX IF EXISTS public.ix_sales_contacts_phone;
DROP INDEX IF EXISTS public.ix_sales_contacts_id;
DROP INDEX IF EXISTS public.ix_sales_campaigns_script_id;
DROP INDEX IF EXISTS public.ix_sales_campaigns_id;
DROP INDEX IF EXISTS public.ix_sales_campaign_contacts_id;
DROP INDEX IF EXISTS public.ix_sales_campaign_contacts_contact_id;
DROP INDEX IF EXISTS public.ix_sales_campaign_contacts_campaign_id;
DROP INDEX IF EXISTS public.ix_sales_calls_id;
DROP INDEX IF EXISTS public.ix_sales_calls_contact_id;
DROP INDEX IF EXISTS public.ix_sales_calls_campaign_id;
DROP INDEX IF EXISTS public.ix_knowledge_base_id;
DROP INDEX IF EXISTS public.ix_knowledge_base_category;
DROP INDEX IF EXISTS public.ix_criteria_key;
DROP INDEX IF EXISTS public.ix_criteria_id;
DROP INDEX IF EXISTS public.ix_calls_manager_id;
DROP INDEX IF EXISTS public.ix_calls_id;
DROP INDEX IF EXISTS public.ix_call_type_criteria_id;
DROP INDEX IF EXISTS public.ix_call_type_criteria_call_type;
DROP INDEX IF EXISTS public.ix_call_criteria_scores_id;
DROP INDEX IF EXISTS public.ix_call_criteria_scores_call_id;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_scripts DROP CONSTRAINT IF EXISTS sales_scripts_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_contacts DROP CONSTRAINT IF EXISTS sales_contacts_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_campaigns DROP CONSTRAINT IF EXISTS sales_campaigns_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_campaign_contacts DROP CONSTRAINT IF EXISTS sales_campaign_contacts_pkey;
ALTER TABLE IF EXISTS ONLY public.sales_calls DROP CONSTRAINT IF EXISTS sales_calls_pkey;
ALTER TABLE IF EXISTS ONLY public.knowledge_base DROP CONSTRAINT IF EXISTS knowledge_base_pkey;
ALTER TABLE IF EXISTS ONLY public.criteria DROP CONSTRAINT IF EXISTS criteria_pkey;
ALTER TABLE IF EXISTS ONLY public.calls DROP CONSTRAINT IF EXISTS calls_pkey;
ALTER TABLE IF EXISTS ONLY public.call_type_criteria DROP CONSTRAINT IF EXISTS call_type_criteria_pkey;
ALTER TABLE IF EXISTS ONLY public.call_criteria_scores DROP CONSTRAINT IF EXISTS call_criteria_scores_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sales_scripts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sales_contacts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sales_campaigns ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sales_campaign_contacts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.sales_calls ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.knowledge_base ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.criteria ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.calls ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.call_type_criteria ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.call_criteria_scores ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP SEQUENCE IF EXISTS public.sales_scripts_id_seq;
DROP TABLE IF EXISTS public.sales_scripts;
DROP SEQUENCE IF EXISTS public.sales_contacts_id_seq;
DROP TABLE IF EXISTS public.sales_contacts;
DROP SEQUENCE IF EXISTS public.sales_campaigns_id_seq;
DROP TABLE IF EXISTS public.sales_campaigns;
DROP SEQUENCE IF EXISTS public.sales_campaign_contacts_id_seq;
DROP TABLE IF EXISTS public.sales_campaign_contacts;
DROP SEQUENCE IF EXISTS public.sales_calls_id_seq;
DROP TABLE IF EXISTS public.sales_calls;
DROP SEQUENCE IF EXISTS public.knowledge_base_id_seq;
DROP TABLE IF EXISTS public.knowledge_base;
DROP SEQUENCE IF EXISTS public.criteria_id_seq;
DROP TABLE IF EXISTS public.criteria;
DROP SEQUENCE IF EXISTS public.calls_id_seq;
DROP TABLE IF EXISTS public.calls;
DROP SEQUENCE IF EXISTS public.call_type_criteria_id_seq;
DROP TABLE IF EXISTS public.call_type_criteria;
DROP SEQUENCE IF EXISTS public.call_criteria_scores_id_seq;
DROP TABLE IF EXISTS public.call_criteria_scores;
DROP TYPE IF EXISTS public.userrole;
DROP TYPE IF EXISTS public.scriptcompliance;
DROP TYPE IF EXISTS public.saleresult;
DROP TYPE IF EXISTS public.salecallstatus;
DROP TYPE IF EXISTS public.calltype;
DROP TYPE IF EXISTS public.callstatus;
--
-- Name: callstatus; Type: TYPE; Schema: public; Owner: callanalytics
--

CREATE TYPE public.callstatus AS ENUM (
    'UPLOADED',
    'PROCESSING',
    'TRANSCRIBED',
    'ANALYZED',
    'FAILED'
);


ALTER TYPE public.callstatus OWNER TO callanalytics;

--
-- Name: calltype; Type: TYPE; Schema: public; Owner: callanalytics
--

CREATE TYPE public.calltype AS ENUM (
    'NEW_LEAD',
    'ACCELERATION',
    'AUTO_ANSWER',
    'CLARIFICATION'
);


ALTER TYPE public.calltype OWNER TO callanalytics;

--
-- Name: salecallstatus; Type: TYPE; Schema: public; Owner: callanalytics
--

CREATE TYPE public.salecallstatus AS ENUM (
    'PENDING',
    'DIALING',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED'
);


ALTER TYPE public.salecallstatus OWNER TO callanalytics;

--
-- Name: saleresult; Type: TYPE; Schema: public; Owner: callanalytics
--

CREATE TYPE public.saleresult AS ENUM (
    'NO_ANSWER',
    'NOT_INTERESTED',
    'INTERESTED',
    'MEETING_SET',
    'CALLBACK'
);


ALTER TYPE public.saleresult OWNER TO callanalytics;

--
-- Name: scriptcompliance; Type: TYPE; Schema: public; Owner: callanalytics
--

CREATE TYPE public.scriptcompliance AS ENUM (
    'COMPLIANT',
    'PARTIAL',
    'NON_COMPLIANT'
);


ALTER TYPE public.scriptcompliance OWNER TO callanalytics;

--
-- Name: userrole; Type: TYPE; Schema: public; Owner: callanalytics
--

CREATE TYPE public.userrole AS ENUM (
    'ADMIN',
    'MANAGER'
);


ALTER TYPE public.userrole OWNER TO callanalytics;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: call_criteria_scores; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.call_criteria_scores (
    id integer NOT NULL,
    call_id integer NOT NULL,
    criteria_id integer NOT NULL,
    score double precision NOT NULL,
    max_score double precision NOT NULL,
    comment text
);


ALTER TABLE public.call_criteria_scores OWNER TO callanalytics;

--
-- Name: call_criteria_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.call_criteria_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.call_criteria_scores_id_seq OWNER TO callanalytics;

--
-- Name: call_criteria_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.call_criteria_scores_id_seq OWNED BY public.call_criteria_scores.id;


--
-- Name: call_type_criteria; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.call_type_criteria (
    id integer NOT NULL,
    call_type character varying(50) NOT NULL,
    criteria_id integer NOT NULL,
    max_score double precision NOT NULL,
    sort_order integer NOT NULL
);


ALTER TABLE public.call_type_criteria OWNER TO callanalytics;

--
-- Name: call_type_criteria_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.call_type_criteria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.call_type_criteria_id_seq OWNER TO callanalytics;

--
-- Name: call_type_criteria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.call_type_criteria_id_seq OWNED BY public.call_type_criteria.id;


--
-- Name: calls; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.calls (
    id integer NOT NULL,
    manager_id integer NOT NULL,
    original_filename character varying(500) NOT NULL,
    file_path character varying(1000),
    duration_seconds double precision,
    status public.callstatus NOT NULL,
    transcript text,
    transcript_confidence double precision,
    whisper_model character varying(50),
    analysis json,
    script_compliance public.scriptcompliance,
    compliance_score double precision,
    talk_ratio double precision,
    emotions json,
    keywords_found json,
    objections_handled json,
    source character varying(50),
    source_file_id character varying(500),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    processed_at timestamp with time zone,
    progress integer DEFAULT 0,
    call_type character varying(50) DEFAULT 'new_lead'::character varying NOT NULL,
    exclude_from_rating boolean DEFAULT false
);


ALTER TABLE public.calls OWNER TO callanalytics;

--
-- Name: calls_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.calls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calls_id_seq OWNER TO callanalytics;

--
-- Name: calls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.calls_id_seq OWNED BY public.calls.id;


--
-- Name: criteria; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.criteria (
    id integer NOT NULL,
    key character varying(50) NOT NULL,
    label character varying(200) NOT NULL,
    description text,
    what_to_check text,
    bad_example text,
    partial_example text,
    good_example text,
    max_score double precision NOT NULL,
    sort_order integer NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.criteria OWNER TO callanalytics;

--
-- Name: criteria_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.criteria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.criteria_id_seq OWNER TO callanalytics;

--
-- Name: criteria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.criteria_id_seq OWNED BY public.criteria.id;


--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.knowledge_base (
    id integer NOT NULL,
    title character varying(300) NOT NULL,
    content text NOT NULL,
    category character varying(100) NOT NULL,
    sort_order integer NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.knowledge_base OWNER TO callanalytics;

--
-- Name: knowledge_base_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.knowledge_base_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knowledge_base_id_seq OWNER TO callanalytics;

--
-- Name: knowledge_base_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.knowledge_base_id_seq OWNED BY public.knowledge_base.id;


--
-- Name: sales_calls; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.sales_calls (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    contact_id integer NOT NULL,
    phone character varying(50) NOT NULL,
    duration_seconds double precision,
    status public.salecallstatus NOT NULL,
    result public.saleresult,
    result_reason text,
    script_stage character varying(100),
    conversation json,
    summary text,
    quality_score double precision,
    quality_details json,
    client_data json,
    simulation_config json,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone
);


ALTER TABLE public.sales_calls OWNER TO callanalytics;

--
-- Name: sales_calls_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.sales_calls_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_calls_id_seq OWNER TO callanalytics;

--
-- Name: sales_calls_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.sales_calls_id_seq OWNED BY public.sales_calls.id;


--
-- Name: sales_campaign_contacts; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.sales_campaign_contacts (
    id integer NOT NULL,
    campaign_id integer NOT NULL,
    contact_id integer NOT NULL,
    status character varying(50),
    called_at timestamp with time zone
);


ALTER TABLE public.sales_campaign_contacts OWNER TO callanalytics;

--
-- Name: sales_campaign_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.sales_campaign_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_campaign_contacts_id_seq OWNER TO callanalytics;

--
-- Name: sales_campaign_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.sales_campaign_contacts_id_seq OWNED BY public.sales_campaign_contacts.id;


--
-- Name: sales_campaigns; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.sales_campaigns (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    script_id integer NOT NULL,
    status character varying(50),
    max_calls_per_day integer,
    call_interval_seconds integer,
    working_hours_start character varying(5),
    working_hours_end character varying(5),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    completed_at timestamp with time zone
);


ALTER TABLE public.sales_campaigns OWNER TO callanalytics;

--
-- Name: sales_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.sales_campaigns_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_campaigns_id_seq OWNER TO callanalytics;

--
-- Name: sales_campaigns_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.sales_campaigns_id_seq OWNED BY public.sales_campaigns.id;


--
-- Name: sales_contacts; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.sales_contacts (
    id integer NOT NULL,
    name character varying(255),
    phone character varying(50) NOT NULL,
    company character varying(255),
    extra_data json,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sales_contacts OWNER TO callanalytics;

--
-- Name: sales_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.sales_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_contacts_id_seq OWNER TO callanalytics;

--
-- Name: sales_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.sales_contacts_id_seq OWNED BY public.sales_contacts.id;


--
-- Name: sales_scripts; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.sales_scripts (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    script_data json NOT NULL,
    system_prompt text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sales_scripts OWNER TO callanalytics;

--
-- Name: sales_scripts_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.sales_scripts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_scripts_id_seq OWNER TO callanalytics;

--
-- Name: sales_scripts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.sales_scripts_id_seq OWNED BY public.sales_scripts.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: callanalytics
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(100) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    role public.userrole NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO callanalytics;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: callanalytics
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO callanalytics;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: callanalytics
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: call_criteria_scores id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.call_criteria_scores ALTER COLUMN id SET DEFAULT nextval('public.call_criteria_scores_id_seq'::regclass);


--
-- Name: call_type_criteria id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.call_type_criteria ALTER COLUMN id SET DEFAULT nextval('public.call_type_criteria_id_seq'::regclass);


--
-- Name: calls id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.calls ALTER COLUMN id SET DEFAULT nextval('public.calls_id_seq'::regclass);


--
-- Name: criteria id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.criteria ALTER COLUMN id SET DEFAULT nextval('public.criteria_id_seq'::regclass);


--
-- Name: knowledge_base id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.knowledge_base ALTER COLUMN id SET DEFAULT nextval('public.knowledge_base_id_seq'::regclass);


--
-- Name: sales_calls id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_calls ALTER COLUMN id SET DEFAULT nextval('public.sales_calls_id_seq'::regclass);


--
-- Name: sales_campaign_contacts id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_campaign_contacts ALTER COLUMN id SET DEFAULT nextval('public.sales_campaign_contacts_id_seq'::regclass);


--
-- Name: sales_campaigns id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_campaigns ALTER COLUMN id SET DEFAULT nextval('public.sales_campaigns_id_seq'::regclass);


--
-- Name: sales_contacts id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_contacts ALTER COLUMN id SET DEFAULT nextval('public.sales_contacts_id_seq'::regclass);


--
-- Name: sales_scripts id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_scripts ALTER COLUMN id SET DEFAULT nextval('public.sales_scripts_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: call_criteria_scores; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.call_criteria_scores (id, call_id, criteria_id, score, max_score, comment) FROM stdin;
\.


--
-- Data for Name: call_type_criteria; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.call_type_criteria (id, call_type, criteria_id, max_score, sort_order) FROM stdin;
\.


--
-- Data for Name: calls; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.calls (id, manager_id, original_filename, file_path, duration_seconds, status, transcript, transcript_confidence, whisper_model, analysis, script_compliance, compliance_score, talk_ratio, emotions, keywords_found, objections_handled, source, source_file_id, created_at, updated_at, processed_at, progress, call_type, exclude_from_rating) FROM stdin;
51	2	velikzhanin_aleksandr_out_79853801767_2026_04_27_10_23_19_ow25.mp3	/app/uploads/3dcf1409-03a3-4c97-97c8-fbb23689ccdb.mp3	217.94000244140625	ANALYZED	Геннадий, удобно? Да, да. Да, вы вон по предложению сейчас посмотрел, а мне как лучше сработать, посчитать? Там ДФКС предложил без программы, без удаления сажевого фильтра, без заглушения EGR. Я могу это вычесть и попробовать согласовать цену такую или ниже. Или могу оставить все по ТЗ. Как обсуждали с самого начала, две из изменений. Но цену я смогу сделать, попробую по крайней мере, дешевле, чем у ДФКС, но грубо там на 10 тысяч рублей. Я объяснил всем? Нормально, но мне надо все по этому оставить. Я могу объяснить, допустим, ту же наценку на услуги удаления сажевого, перепрошивки, еще что-то. Понимаю, что оплачивается, но сама базовая стоимость. Оставляем в общем по ТЗ все. Обязательно, да. У вас плюс будет то, что вы по ТЗ выигрываете. Ну да. И по цене мы тоже постараемся сейчас. Но я просто, знаете в чему? Я считаю, что нашу доходность посчитал. И вообще на самом деле приходится рисковать в данном случае. Хочется, чтобы вы остались с нами. А КС остался со спецпрома. И ни в коем случае сделку не отдавать ЕТКС. Ну потому что так завелось. Мы с вами работаем, договоры заключены. Все легко и просто уже идет. И общение налажено. Но я тут рискую. Я вам объясню просто, чтобы понимали в чем дело. Сейчас в Садку с двухрядными, с однорядными есть ограничения. То есть машин нет вообще. Мы под застройку фазис покупаем. Я вот прежде чем коммерческое предложение согласовать, я тогда считал машину по РРЦ минус 6%. Сейчас их, во-первых, нет. И дилеры их отдают по РРЦ. Ну то есть я уже на 6% здесь теряю. У меня сделка получается там, ну грубо говоря, там около нулевая. Только для того, чтобы оставить вас. Вы там плюс-минус 5% же можете потом как бы подвинуться. Ну потому что сейчас все дорожает. И под этим вот каким-то там этим соусом. И вот второй момент. Я переживаю за то, что вот, например, мы заключим сейчас контракт, а у меня там по срокам будут какие-то проблемы, потому что Садко не найти сейчас по всей стране. И АИТКС, я не знаю каким образом они это предложили. Ну то есть ради чего? Только для того, чтобы там тоже что ли? И более 2 единицы. Он тоже в курсе, что 2 единицы. Поэтому то есть одинаковое. То есть это для всех было. В общем сейчас это сделаем. А вы успеваете в апреле заключиться или нет? Как думаете? Я даже думать здесь не буду. Вам даже обнадеживать мне ничем. Потому что как у нас в апреле? В апреле точно нет. Потому что у нас, ну сами понимаете, процедуры такие что. Я поэтому даже вам обещать ничего не буду. Они сейчас будут еще неделю думать. Короче там все на май перейдет и нам после майских праздников. Ну да, да, да. Так и будет. Ладно. В общем пошел сейчас. Я без передачи никуда не уйдет. Я сейчас коммерческое распечатаю. Пойду к директору. Все объясню. Вот хотя бы у меня какие-то аргументы будут. Будем думать что делать. Без вопросов. Все давайте. Я поделился с вами. Там принимайте решения. Да. Я сейчас все сделаю. Я уверен, что мы с вами останемся. И вы с нами останетесь. Так что сейчас я пошел к шефу. Все договорились. Ладно. Позвоню вам тогда. Да и вам тоже.	0.95	large-v3	{"call_type": "acceleration", "warmth": "warm", "criteria_scores": {"greeting": 0, "speech": 0.5, "initiative": 0, "programming": 0, "qualification": 0.5, "pain": 0.5, "product": 0, "expertise": 0.5, "closing": 0.5, "push": 0, "next_step": 0.5, "framing": 0.5}, "criteria_details": {"greeting": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043d\\u0435 \\u043f\\u0440\\u0435\\u0434\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0441\\u044f \\u0438 \\u043d\\u0435 \\u043d\\u0430\\u0437\\u0432\\u0430\\u043b \\u0446\\u0435\\u043b\\u044c \\u0437\\u0432\\u043e\\u043d\\u043a\\u0430, \\u0447\\u0442\\u043e \\u044f\\u0432\\u043b\\u044f\\u0435\\u0442\\u0441\\u044f \\u0443\\u043f\\u0443\\u0449\\u0435\\u043d\\u0438\\u0435\\u043c. \\u041e\\u043d \\u0441\\u0440\\u0430\\u0437\\u0443 \\u043d\\u0430\\u0447\\u0430\\u043b \\u0441 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u0430, \\u0447\\u0442\\u043e \\u043d\\u0435 \\u0441\\u043e\\u043e\\u0442\\u0432\\u0435\\u0442\\u0441\\u0442\\u0432\\u0443\\u0435\\u0442 \\u043f\\u043e\\u043b\\u043d\\u043e\\u043c\\u0443 \\u043f\\u0440\\u0438\\u0432\\u0435\\u0442\\u0441\\u0442\\u0432\\u0438\\u044e.", "speech": "\\u0420\\u0435\\u0447\\u044c \\u043c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440\\u0430 \\u0431\\u044b\\u043b\\u0430 \\u043d\\u0435\\u0447\\u0435\\u0442\\u043a\\u043e\\u0439, \\u0441 \\u043d\\u0435\\u043a\\u043e\\u0442\\u043e\\u0440\\u044b\\u043c\\u0438 \\u043f\\u0430\\u0443\\u0437\\u0430\\u043c\\u0438 \\u0438 \\u043d\\u0435\\u0441\\u0442\\u0440\\u0443\\u043a\\u0442\\u0443\\u0440\\u0438\\u0440\\u043e\\u0432\\u0430\\u043d\\u043d\\u044b\\u043c\\u0438 \\u0444\\u0440\\u0430\\u0437\\u0430\\u043c\\u0438, \\u0447\\u0442\\u043e \\u0437\\u0430\\u0442\\u0440\\u0443\\u0434\\u043d\\u044f\\u043b\\u043e \\u043f\\u043e\\u043d\\u0438\\u043c\\u0430\\u043d\\u0438\\u0435. \\u041e\\u0434\\u043d\\u0430\\u043a\\u043e, \\u0440\\u0435\\u0434\\u043a\\u0438\\u0435 \\u0441\\u043b\\u043e\\u0432\\u0430-\\u043f\\u0430\\u0440\\u0430\\u0437\\u0438\\u0442\\u044b \\u043d\\u0435 \\u043c\\u0435\\u0448\\u0430\\u043b\\u0438 \\u043e\\u0431\\u0449\\u0435\\u043d\\u0438\\u044e.", "initiative": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043d\\u0435 \\u043f\\u0440\\u043e\\u044f\\u0432\\u043b\\u044f\\u043b \\u0438\\u043d\\u0438\\u0446\\u0438\\u0430\\u0442\\u0438\\u0432\\u0443 \\u0432 \\u0443\\u043f\\u0440\\u0430\\u0432\\u043b\\u0435\\u043d\\u0438\\u0438 \\u0434\\u0438\\u0430\\u043b\\u043e\\u0433\\u043e\\u043c, \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442 \\u0437\\u0430\\u0434\\u0430\\u0432\\u0430\\u043b \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b \\u0438 \\u0432\\u0451\\u043b \\u0440\\u0430\\u0437\\u0433\\u043e\\u0432\\u043e\\u0440.", "programming": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043d\\u0435 \\u0438\\u0441\\u043f\\u043e\\u043b\\u044c\\u0437\\u043e\\u0432\\u0430\\u043b \\u0441\\u0442\\u0440\\u0443\\u043a\\u0442\\u0443\\u0440\\u0443 \\u043f\\u0435\\u0440\\u0435\\u0445\\u0432\\u0430\\u0442 \\u2192 \\u0446\\u0435\\u043b\\u044c \\u2192 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441, \\u0447\\u0442\\u043e \\u044f\\u0432\\u043b\\u044f\\u0435\\u0442\\u0441\\u044f \\u043d\\u0435\\u0434\\u043e\\u0441\\u0442\\u0430\\u0442\\u043a\\u043e\\u043c \\u0432 \\u0443\\u043f\\u0440\\u0430\\u0432\\u043b\\u0435\\u043d\\u0438\\u0438 \\u0440\\u0430\\u0437\\u0433\\u043e\\u0432\\u043e\\u0440\\u043e\\u043c.", "qualification": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u0437\\u0430\\u0434\\u0430\\u043b \\u043d\\u0435\\u043a\\u043e\\u0442\\u043e\\u0440\\u044b\\u0435 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b, \\u043d\\u043e \\u0438\\u0445 \\u0431\\u044b\\u043b\\u043e \\u043d\\u0435\\u0434\\u043e\\u0441\\u0442\\u0430\\u0442\\u043e\\u0447\\u043d\\u043e \\u0434\\u043b\\u044f \\u043f\\u043e\\u043b\\u043d\\u043e\\u0433\\u043e \\u0432\\u044b\\u044f\\u0432\\u043b\\u0435\\u043d\\u0438\\u044f \\u043f\\u043e\\u0442\\u0440\\u0435\\u0431\\u043d\\u043e\\u0441\\u0442\\u0435\\u0439 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430.", "pain": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043a\\u043e\\u0441\\u043d\\u0443\\u043b\\u0441\\u044f \\u043d\\u0435\\u043a\\u043e\\u0442\\u043e\\u0440\\u044b\\u0445 \\u043f\\u0440\\u043e\\u0431\\u043b\\u0435\\u043c \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430, \\u043d\\u043e \\u043d\\u0435 \\u0437\\u0430\\u0434\\u0430\\u043b \\u043a\\u043e\\u043d\\u043a\\u0440\\u0435\\u0442\\u043d\\u044b\\u0445 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432, \\u0447\\u0442\\u043e\\u0431\\u044b \\u0433\\u043b\\u0443\\u0431\\u0436\\u0435 \\u043f\\u043e\\u043d\\u044f\\u0442\\u044c \\u0438\\u0445.", "product": "\\u041f\\u0440\\u0435\\u0437\\u0435\\u043d\\u0442\\u0430\\u0446\\u0438\\u044f \\u043f\\u0440\\u043e\\u0434\\u0443\\u043a\\u0442\\u0430 \\u043e\\u0442\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u043e\\u0432\\u0430\\u043b\\u0430, \\u043c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043d\\u0435 \\u043e\\u0431\\u044a\\u044f\\u0441\\u043d\\u0438\\u043b, \\u043a\\u0430\\u043a\\u0438\\u0435 \\u0432\\u044b\\u0433\\u043e\\u0434\\u044b \\u043c\\u043e\\u0436\\u0435\\u0442 \\u043f\\u043e\\u043b\\u0443\\u0447\\u0438\\u0442\\u044c \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442.", "expertise": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043f\\u0440\\u043e\\u0434\\u0435\\u043c\\u043e\\u043d\\u0441\\u0442\\u0440\\u0438\\u0440\\u043e\\u0432\\u0430\\u043b \\u043d\\u0435\\u043a\\u043e\\u0442\\u043e\\u0440\\u0443\\u044e \\u043e\\u0441\\u0432\\u0435\\u0434\\u043e\\u043c\\u043b\\u0435\\u043d\\u043d\\u043e\\u0441\\u0442\\u044c \\u043e \\u0440\\u044b\\u043d\\u043a\\u0435, \\u043d\\u043e \\u043d\\u0435 \\u0441\\u043c\\u043e\\u0433 \\u043e\\u0442\\u0432\\u0435\\u0442\\u0438\\u0442\\u044c \\u043d\\u0430 \\u0432\\u0441\\u0435 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430.", "closing": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043d\\u0435 \\u0437\\u0430\\u043a\\u0440\\u044b\\u043b \\u0441\\u0434\\u0435\\u043b\\u043a\\u0443, \\u043d\\u043e \\u043f\\u043e\\u043f\\u044b\\u0442\\u0430\\u043b\\u0441\\u044f \\u043d\\u0430\\u0437\\u043d\\u0430\\u0447\\u0438\\u0442\\u044c \\u0441\\u043b\\u0435\\u0434\\u0443\\u044e\\u0449\\u0438\\u0439 \\u0448\\u0430\\u0433, \\u0447\\u0442\\u043e \\u044f\\u0432\\u043b\\u044f\\u0435\\u0442\\u0441\\u044f \\u0447\\u0430\\u0441\\u0442\\u0438\\u0447\\u043d\\u044b\\u043c \\u0443\\u0441\\u043f\\u0435\\u0445\\u043e\\u043c.", "push": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043d\\u0435 \\u043e\\u0442\\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u043b \\u0432\\u043e\\u0437\\u0440\\u0430\\u0436\\u0435\\u043d\\u0438\\u044f \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430, \\u0441\\u043e\\u0433\\u043b\\u0430\\u0441\\u0438\\u043b\\u0441\\u044f \\u0441 \\u043d\\u0438\\u043c\\u0438 \\u0438 \\u043d\\u0435 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0438\\u043b \\u0440\\u0435\\u0448\\u0435\\u043d\\u0438\\u044f.", "next_step": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u0443\\u043f\\u043e\\u043c\\u044f\\u043d\\u0443\\u043b, \\u0447\\u0442\\u043e \\u043f\\u043e\\u0437\\u0432\\u043e\\u043d\\u0438\\u0442 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0443, \\u043d\\u043e \\u043d\\u0435 \\u0443\\u043a\\u0430\\u0437\\u0430\\u043b \\u043a\\u043e\\u043d\\u043a\\u0440\\u0435\\u0442\\u043d\\u043e\\u0435 \\u0432\\u0440\\u0435\\u043c\\u044f, \\u0447\\u0442\\u043e \\u0434\\u0435\\u043b\\u0430\\u0435\\u0442 \\u044d\\u0442\\u043e \\u0437\\u0430\\u043a\\u0440\\u044b\\u0442\\u0438\\u0435 \\u043d\\u0435\\u0447\\u0435\\u0442\\u043a\\u0438\\u043c.", "framing": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043f\\u044b\\u0442\\u0430\\u043b\\u0441\\u044f \\u043f\\u043e\\u0434\\u0441\\u0442\\u0440\\u043e\\u0438\\u0442\\u044c\\u0441\\u044f \\u043f\\u043e\\u0434 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430, \\u043d\\u043e \\u043d\\u0435 \\u0432\\u0441\\u0435\\u0433\\u0434\\u0430 \\u0438\\u0441\\u043f\\u043e\\u043b\\u044c\\u0437\\u043e\\u0432\\u0430\\u043b \\u043e\\u0431\\u0449\\u0438\\u0439 \\u044f\\u0437\\u044b\\u043a, \\u0447\\u0442\\u043e \\u0441\\u043e\\u0437\\u0434\\u0430\\u0432\\u0430\\u043b\\u043e \\u043d\\u0435\\u0434\\u043e\\u043f\\u043e\\u043d\\u0438\\u043c\\u0430\\u043d\\u0438\\u044f."}, "fg_score": 45.83, "objection_count": 2, "objection_types": ["\\u0446\\u0435\\u043d\\u0430", "\\u0441\\u0440\\u043e\\u043a\\u0438"], "manager_tone": "neutral", "client_tone": "neutral", "crm_quality": 0, "compliance": {"score": 0, "level": "non_compliant", "details": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043d\\u0435 \\u0441\\u043e\\u0431\\u043b\\u044e\\u0434\\u0430\\u043b \\u043e\\u0441\\u043d\\u043e\\u0432\\u043d\\u044b\\u0435 \\u044d\\u0442\\u0430\\u043f\\u044b \\u0441\\u043a\\u0440\\u0438\\u043f\\u0442\\u0430 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436, \\u0447\\u0442\\u043e \\u043f\\u0440\\u0438\\u0432\\u0435\\u043b\\u043e \\u043a \\u043d\\u0435\\u0434\\u043e\\u0441\\u0442\\u0430\\u0442\\u043e\\u0447\\u043d\\u043e\\u0439 \\u044d\\u0444\\u0444\\u0435\\u043a\\u0442\\u0438\\u0432\\u043d\\u043e\\u0441\\u0442\\u0438 \\u0437\\u0432\\u043e\\u043d\\u043a\\u0430."}, "summary": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043d\\u0435 \\u043f\\u0440\\u0435\\u0434\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0441\\u044f \\u0438 \\u043d\\u0435 \\u043f\\u0440\\u043e\\u044f\\u0432\\u0438\\u043b \\u0438\\u043d\\u0438\\u0446\\u0438\\u0430\\u0442\\u0438\\u0432\\u0443 \\u0432 \\u0440\\u0430\\u0437\\u0433\\u043e\\u0432\\u043e\\u0440\\u0435, \\u0447\\u0442\\u043e \\u043d\\u0435\\u0433\\u0430\\u0442\\u0438\\u0432\\u043d\\u043e \\u0441\\u043a\\u0430\\u0437\\u0430\\u043b\\u043e\\u0441\\u044c \\u043d\\u0430 \\u0435\\u0433\\u043e \\u043e\\u0446\\u0435\\u043d\\u043a\\u0435. \\u041e\\u043d \\u043d\\u0435 \\u0437\\u0430\\u043a\\u0440\\u044b\\u043b \\u0441\\u0434\\u0435\\u043b\\u043a\\u0443, \\u043d\\u043e \\u043f\\u043e\\u043f\\u044b\\u0442\\u0430\\u043b\\u0441\\u044f \\u043d\\u0430\\u0437\\u043d\\u0430\\u0447\\u0438\\u0442\\u044c \\u0441\\u043b\\u0435\\u0434\\u0443\\u044e\\u0449\\u0438\\u0439 \\u0448\\u0430\\u0433, \\u0447\\u0442\\u043e \\u044f\\u0432\\u043b\\u044f\\u0435\\u0442\\u0441\\u044f \\u0447\\u0430\\u0441\\u0442\\u0438\\u0447\\u043d\\u044b\\u043c \\u0443\\u0441\\u043f\\u0435\\u0445\\u043e\\u043c.", "strengths": ["\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043f\\u0440\\u043e\\u0434\\u0435\\u043c\\u043e\\u043d\\u0441\\u0442\\u0440\\u0438\\u0440\\u043e\\u0432\\u0430\\u043b \\u0437\\u043d\\u0430\\u043d\\u0438\\u0435 \\u0440\\u044b\\u043d\\u043a\\u0430 \\u0438 \\u0446\\u0435\\u043d, \\u0447\\u0442\\u043e \\u043c\\u043e\\u0436\\u0435\\u0442 \\u0431\\u044b\\u0442\\u044c \\u043f\\u043e\\u043b\\u0435\\u0437\\u043d\\u044b\\u043c \\u0434\\u043b\\u044f \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430.", "\\u041e\\u043d \\u043f\\u044b\\u0442\\u0430\\u043b\\u0441\\u044f \\u043f\\u043e\\u043d\\u044f\\u0442\\u044c \\u043f\\u043e\\u0442\\u0440\\u0435\\u0431\\u043d\\u043e\\u0441\\u0442\\u0438 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430, \\u0437\\u0430\\u0434\\u0430\\u0432\\u0430\\u044f \\u043d\\u0435\\u043a\\u043e\\u0442\\u043e\\u0440\\u044b\\u0435 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b."], "growth_areas": ["\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u0434\\u043e\\u043b\\u0436\\u0435\\u043d \\u043d\\u0430\\u0447\\u0430\\u0442\\u044c \\u0440\\u0430\\u0437\\u0433\\u043e\\u0432\\u043e\\u0440 \\u0441 \\u043f\\u0440\\u0435\\u0434\\u0441\\u0442\\u0430\\u0432\\u043b\\u0435\\u043d\\u0438\\u044f \\u0438 \\u0447\\u0435\\u0442\\u043a\\u043e\\u0433\\u043e \\u043e\\u0431\\u044a\\u044f\\u0441\\u043d\\u0435\\u043d\\u0438\\u044f \\u0446\\u0435\\u043b\\u0438 \\u0437\\u0432\\u043e\\u043d\\u043a\\u0430.", "\\u041d\\u0435\\u043e\\u0431\\u0445\\u043e\\u0434\\u0438\\u043c\\u043e \\u0443\\u043b\\u0443\\u0447\\u0448\\u0438\\u0442\\u044c \\u0441\\u0442\\u0440\\u0443\\u043a\\u0442\\u0443\\u0440\\u0443 \\u0440\\u0435\\u0447\\u0438, \\u0447\\u0442\\u043e\\u0431\\u044b \\u0438\\u0437\\u0431\\u0435\\u0436\\u0430\\u0442\\u044c \\u043f\\u0430\\u0443\\u0437 \\u0438 \\u043d\\u0435\\u044f\\u0441\\u043d\\u043e\\u0441\\u0442\\u0435\\u0439.", "\\u0421\\u043b\\u0435\\u0434\\u0443\\u0435\\u0442 \\u0431\\u043e\\u043b\\u044c\\u0448\\u0435 \\u0432\\u043d\\u0438\\u043c\\u0430\\u043d\\u0438\\u044f \\u0443\\u0434\\u0435\\u043b\\u0438\\u0442\\u044c \\u0432\\u044b\\u044f\\u0432\\u043b\\u0435\\u043d\\u0438\\u044e \\u043f\\u043e\\u0442\\u0440\\u0435\\u0431\\u043d\\u043e\\u0441\\u0442\\u0435\\u0439 \\u0438 \\u043e\\u0442\\u0440\\u0430\\u0431\\u043e\\u0442\\u043a\\u0435 \\u0432\\u043e\\u0437\\u0440\\u0430\\u0436\\u0435\\u043d\\u0438\\u0439 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430."], "keywords_found": ["\\u0446\\u0435\\u043d\\u0430", "\\u0441\\u0440\\u043e\\u043a\\u0438", "\\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435", "\\u0434\\u043e\\u0433\\u043e\\u0432\\u043e\\u0440"], "emotions": {"manager_speech_ratio": 40}, "conversation": [{"speaker": "client", "text": "\\u0413\\u0435\\u043d\\u043d\\u0430\\u0434\\u0438\\u0439, \\u0443\\u0434\\u043e\\u0431\\u043d\\u043e?", "timestamp": 0.0}, {"speaker": "client", "text": "\\u0414\\u0430, \\u0434\\u0430.", "timestamp": 2.0}, {"speaker": "client", "text": "\\u0414\\u0430, \\u0432\\u044b \\u0432\\u043e\\u043d \\u043f\\u043e \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u044e \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043f\\u043e\\u0441\\u043c\\u043e\\u0442\\u0440\\u0435\\u043b, \\u0430 \\u043c\\u043d\\u0435", "timestamp": 4.0}, {"speaker": "client", "text": "\\u043a\\u0430\\u043a \\u043b\\u0443\\u0447\\u0448\\u0435 \\u0441\\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u0442\\u044c, \\u043f\\u043e\\u0441\\u0447\\u0438\\u0442\\u0430\\u0442\\u044c?", "timestamp": 8.0}, {"speaker": "client", "text": "\\u0422\\u0430\\u043c \\u0414\\u0424\\u041a\\u0421 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0438\\u043b \\u0431\\u0435\\u0437 \\u043f\\u0440\\u043e\\u0433\\u0440\\u0430\\u043c\\u043c\\u044b, \\u0431\\u0435\\u0437 \\u0443\\u0434\\u0430\\u043b\\u0435\\u043d\\u0438\\u044f \\u0441\\u0430\\u0436\\u0435\\u0432\\u043e\\u0433\\u043e \\u0444\\u0438\\u043b\\u044c\\u0442\\u0440\\u0430,", "timestamp": 11.0}, {"speaker": "client", "text": "\\u0431\\u0435\\u0437 \\u0437\\u0430\\u0433\\u043b\\u0443\\u0448\\u0435\\u043d\\u0438\\u044f EGR.", "timestamp": 18.0}, {"speaker": "client", "text": "\\u042f \\u043c\\u043e\\u0433\\u0443 \\u044d\\u0442\\u043e \\u0432\\u044b\\u0447\\u0435\\u0441\\u0442\\u044c \\u0438 \\u043f\\u043e\\u043f\\u0440\\u043e\\u0431\\u043e\\u0432\\u0430\\u0442\\u044c \\u0441\\u043e\\u0433\\u043b\\u0430\\u0441\\u043e\\u0432\\u0430\\u0442\\u044c \\u0446\\u0435\\u043d\\u0443 \\u0442\\u0430\\u043a\\u0443\\u044e", "timestamp": 20.0}, {"speaker": "client", "text": "\\u0438\\u043b\\u0438 \\u043d\\u0438\\u0436\\u0435.", "timestamp": 26.0}, {"speaker": "client", "text": "\\u0418\\u043b\\u0438 \\u043c\\u043e\\u0433\\u0443 \\u043e\\u0441\\u0442\\u0430\\u0432\\u0438\\u0442\\u044c \\u0432\\u0441\\u0435 \\u043f\\u043e \\u0422\\u0417.", "timestamp": 27.0}, {"speaker": "client", "text": "\\u041a\\u0430\\u043a \\u043e\\u0431\\u0441\\u0443\\u0436\\u0434\\u0430\\u043b\\u0438 \\u0441 \\u0441\\u0430\\u043c\\u043e\\u0433\\u043e \\u043d\\u0430\\u0447\\u0430\\u043b\\u0430, \\u0434\\u0432\\u0435 \\u0438\\u0437 \\u0438\\u0437\\u043c\\u0435\\u043d\\u0435\\u043d\\u0438\\u0439.", "timestamp": 30.0}, {"speaker": "client", "text": "\\u041d\\u043e \\u0446\\u0435\\u043d\\u0443 \\u044f \\u0441\\u043c\\u043e\\u0433\\u0443 \\u0441\\u0434\\u0435\\u043b\\u0430\\u0442\\u044c, \\u043f\\u043e\\u043f\\u0440\\u043e\\u0431\\u0443\\u044e \\u043f\\u043e \\u043a\\u0440\\u0430\\u0439\\u043d\\u0435\\u0439 \\u043c\\u0435\\u0440\\u0435,", "timestamp": 33.0}, {"speaker": "client", "text": "\\u0434\\u0435\\u0448\\u0435\\u0432\\u043b\\u0435, \\u0447\\u0435\\u043c \\u0443 \\u0414\\u0424\\u041a\\u0421, \\u043d\\u043e \\u0433\\u0440\\u0443\\u0431\\u043e \\u0442\\u0430\\u043c \\u043d\\u0430 10 \\u0442\\u044b\\u0441\\u044f\\u0447 \\u0440\\u0443\\u0431\\u043b\\u0435\\u0439.", "timestamp": 38.0}, {"speaker": "client", "text": "\\u042f \\u043e\\u0431\\u044a\\u044f\\u0441\\u043d\\u0438\\u043b \\u0432\\u0441\\u0435\\u043c?", "timestamp": 41.0}, {"speaker": "client", "text": "\\u041d\\u043e\\u0440\\u043c\\u0430\\u043b\\u044c\\u043d\\u043e, \\u043d\\u043e \\u043c\\u043d\\u0435 \\u043d\\u0430\\u0434\\u043e \\u0432\\u0441\\u0435 \\u043f\\u043e \\u044d\\u0442\\u043e\\u043c\\u0443 \\u043e\\u0441\\u0442\\u0430\\u0432\\u0438\\u0442\\u044c.", "timestamp": 43.0}, {"speaker": "client", "text": "\\u042f \\u043c\\u043e\\u0433\\u0443 \\u043e\\u0431\\u044a\\u044f\\u0441\\u043d\\u0438\\u0442\\u044c, \\u0434\\u043e\\u043f\\u0443\\u0441\\u0442\\u0438\\u043c, \\u0442\\u0443 \\u0436\\u0435 \\u043d\\u0430\\u0446\\u0435\\u043d\\u043a\\u0443 \\u043d\\u0430 \\u0443\\u0441\\u043b\\u0443\\u0433\\u0438", "timestamp": 46.0}, {"speaker": "client", "text": "\\u0443\\u0434\\u0430\\u043b\\u0435\\u043d\\u0438\\u044f \\u0441\\u0430\\u0436\\u0435\\u0432\\u043e\\u0433\\u043e, \\u043f\\u0435\\u0440\\u0435\\u043f\\u0440\\u043e\\u0448\\u0438\\u0432\\u043a\\u0438, \\u0435\\u0449\\u0435 \\u0447\\u0442\\u043e-\\u0442\\u043e.", "timestamp": 50.0}, {"speaker": "client", "text": "\\u041f\\u043e\\u043d\\u0438\\u043c\\u0430\\u044e, \\u0447\\u0442\\u043e \\u043e\\u043f\\u043b\\u0430\\u0447\\u0438\\u0432\\u0430\\u0435\\u0442\\u0441\\u044f, \\u043d\\u043e \\u0441\\u0430\\u043c\\u0430 \\u0431\\u0430\\u0437\\u043e\\u0432\\u0430\\u044f \\u0441\\u0442\\u043e\\u0438\\u043c\\u043e\\u0441\\u0442\\u044c.", "timestamp": 54.0}, {"speaker": "client", "text": "\\u041e\\u0441\\u0442\\u0430\\u0432\\u043b\\u044f\\u0435\\u043c \\u0432 \\u043e\\u0431\\u0449\\u0435\\u043c \\u043f\\u043e \\u0422\\u0417 \\u0432\\u0441\\u0435.", "timestamp": 61.0}, {"speaker": "client", "text": "\\u041e\\u0431\\u044f\\u0437\\u0430\\u0442\\u0435\\u043b\\u044c\\u043d\\u043e, \\u0434\\u0430.", "timestamp": 64.0}, {"speaker": "client", "text": "\\u0423 \\u0432\\u0430\\u0441 \\u043f\\u043b\\u044e\\u0441 \\u0431\\u0443\\u0434\\u0435\\u0442 \\u0442\\u043e, \\u0447\\u0442\\u043e \\u0432\\u044b \\u043f\\u043e \\u0422\\u0417 \\u0432\\u044b\\u0438\\u0433\\u0440\\u044b\\u0432\\u0430\\u0435\\u0442\\u0435.", "timestamp": 66.0}, {"speaker": "client", "text": "\\u041d\\u0443 \\u0434\\u0430.", "timestamp": 70.0}, {"speaker": "client", "text": "\\u0418 \\u043f\\u043e \\u0446\\u0435\\u043d\\u0435 \\u043c\\u044b \\u0442\\u043e\\u0436\\u0435 \\u043f\\u043e\\u0441\\u0442\\u0430\\u0440\\u0430\\u0435\\u043c\\u0441\\u044f \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441.", "timestamp": 71.0}, {"speaker": "client", "text": "\\u041d\\u043e \\u044f \\u043f\\u0440\\u043e\\u0441\\u0442\\u043e, \\u0437\\u043d\\u0430\\u0435\\u0442\\u0435 \\u0432 \\u0447\\u0435\\u043c\\u0443?", "timestamp": 73.0}, {"speaker": "client", "text": "\\u042f \\u0441\\u0447\\u0438\\u0442\\u0430\\u044e, \\u0447\\u0442\\u043e \\u043d\\u0430\\u0448\\u0443 \\u0434\\u043e\\u0445\\u043e\\u0434\\u043d\\u043e\\u0441\\u0442\\u044c \\u043f\\u043e\\u0441\\u0447\\u0438\\u0442\\u0430\\u043b.", "timestamp": 75.0}, {"speaker": "client", "text": "\\u0418 \\u0432\\u043e\\u043e\\u0431\\u0449\\u0435 \\u043d\\u0430 \\u0441\\u0430\\u043c\\u043e\\u043c \\u0434\\u0435\\u043b\\u0435 \\u043f\\u0440\\u0438\\u0445\\u043e\\u0434\\u0438\\u0442\\u0441\\u044f \\u0440\\u0438\\u0441\\u043a\\u043e\\u0432\\u0430\\u0442\\u044c \\u0432 \\u0434\\u0430\\u043d\\u043d\\u043e\\u043c \\u0441\\u043b\\u0443\\u0447\\u0430\\u0435.", "timestamp": 78.0}, {"speaker": "client", "text": "\\u0425\\u043e\\u0447\\u0435\\u0442\\u0441\\u044f, \\u0447\\u0442\\u043e\\u0431\\u044b \\u0432\\u044b \\u043e\\u0441\\u0442\\u0430\\u043b\\u0438\\u0441\\u044c \\u0441 \\u043d\\u0430\\u043c\\u0438.", "timestamp": 82.0}, {"speaker": "client", "text": "\\u0410 \\u041a\\u0421 \\u043e\\u0441\\u0442\\u0430\\u043b\\u0441\\u044f \\u0441\\u043e \\u0441\\u043f\\u0435\\u0446\\u043f\\u0440\\u043e\\u043c\\u0430.", "timestamp": 87.0}, {"speaker": "client", "text": "\\u0418 \\u043d\\u0438 \\u0432 \\u043a\\u043e\\u0435\\u043c \\u0441\\u043b\\u0443\\u0447\\u0430\\u0435 \\u0441\\u0434\\u0435\\u043b\\u043a\\u0443 \\u043d\\u0435 \\u043e\\u0442\\u0434\\u0430\\u0432\\u0430\\u0442\\u044c \\u0415\\u0422\\u041a\\u0421.", "timestamp": 90.0}, {"speaker": "client", "text": "\\u041d\\u0443 \\u043f\\u043e\\u0442\\u043e\\u043c\\u0443 \\u0447\\u0442\\u043e \\u0442\\u0430\\u043a \\u0437\\u0430\\u0432\\u0435\\u043b\\u043e\\u0441\\u044c.", "timestamp": 92.0}, {"speaker": "client", "text": "\\u041c\\u044b \\u0441 \\u0432\\u0430\\u043c\\u0438 \\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u0435\\u043c, \\u0434\\u043e\\u0433\\u043e\\u0432\\u043e\\u0440\\u044b \\u0437\\u0430\\u043a\\u043b\\u044e\\u0447\\u0435\\u043d\\u044b.", "timestamp": 94.0}, {"speaker": "client", "text": "\\u0412\\u0441\\u0435 \\u043b\\u0435\\u0433\\u043a\\u043e \\u0438 \\u043f\\u0440\\u043e\\u0441\\u0442\\u043e \\u0443\\u0436\\u0435 \\u0438\\u0434\\u0435\\u0442.", "timestamp": 96.0}, {"speaker": "client", "text": "\\u0418 \\u043e\\u0431\\u0449\\u0435\\u043d\\u0438\\u0435 \\u043d\\u0430\\u043b\\u0430\\u0436\\u0435\\u043d\\u043e.", "timestamp": 97.0}, {"speaker": "client", "text": "\\u041d\\u043e \\u044f \\u0442\\u0443\\u0442 \\u0440\\u0438\\u0441\\u043a\\u0443\\u044e.", "timestamp": 98.0}, {"speaker": "client", "text": "\\u042f \\u0432\\u0430\\u043c \\u043e\\u0431\\u044a\\u044f\\u0441\\u043d\\u044e \\u043f\\u0440\\u043e\\u0441\\u0442\\u043e, \\u0447\\u0442\\u043e\\u0431\\u044b \\u043f\\u043e\\u043d\\u0438\\u043c\\u0430\\u043b\\u0438 \\u0432 \\u0447\\u0435\\u043c \\u0434\\u0435\\u043b\\u043e.", "timestamp": 101.0}, {"speaker": "client", "text": "\\u0421\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0432 \\u0421\\u0430\\u0434\\u043a\\u0443 \\u0441 \\u0434\\u0432\\u0443\\u0445\\u0440\\u044f\\u0434\\u043d\\u044b\\u043c\\u0438, \\u0441 \\u043e\\u0434\\u043d\\u043e\\u0440\\u044f\\u0434\\u043d\\u044b\\u043c\\u0438 \\u0435\\u0441\\u0442\\u044c \\u043e\\u0433\\u0440\\u0430\\u043d\\u0438\\u0447\\u0435\\u043d\\u0438\\u044f.", "timestamp": 105.0}, {"speaker": "client", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c \\u043c\\u0430\\u0448\\u0438\\u043d \\u043d\\u0435\\u0442 \\u0432\\u043e\\u043e\\u0431\\u0449\\u0435.", "timestamp": 107.0}, {"speaker": "client", "text": "\\u041c\\u044b \\u043f\\u043e\\u0434 \\u0437\\u0430\\u0441\\u0442\\u0440\\u043e\\u0439\\u043a\\u0443 \\u0444\\u0430\\u0437\\u0438\\u0441 \\u043f\\u043e\\u043a\\u0443\\u043f\\u0430\\u0435\\u043c.", "timestamp": 109.0}, {"speaker": "client", "text": "\\u042f \\u0432\\u043e\\u0442 \\u043f\\u0440\\u0435\\u0436\\u0434\\u0435 \\u0447\\u0435\\u043c \\u043a\\u043e\\u043c\\u043c\\u0435\\u0440\\u0447\\u0435\\u0441\\u043a\\u043e\\u0435 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435 \\u0441\\u043e\\u0433\\u043b\\u0430\\u0441\\u043e\\u0432\\u0430\\u0442\\u044c,", "timestamp": 112.0}, {"speaker": "client", "text": "\\u044f \\u0442\\u043e\\u0433\\u0434\\u0430 \\u0441\\u0447\\u0438\\u0442\\u0430\\u043b \\u043c\\u0430\\u0448\\u0438\\u043d\\u0443 \\u043f\\u043e \\u0420\\u0420\\u0426 \\u043c\\u0438\\u043d\\u0443\\u0441 6%.", "timestamp": 117.0}, {"speaker": "client", "text": "\\u0421\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0438\\u0445, \\u0432\\u043e-\\u043f\\u0435\\u0440\\u0432\\u044b\\u0445, \\u043d\\u0435\\u0442.", "timestamp": 119.0}, {"speaker": "client", "text": "\\u0418 \\u0434\\u0438\\u043b\\u0435\\u0440\\u044b \\u0438\\u0445 \\u043e\\u0442\\u0434\\u0430\\u044e\\u0442 \\u043f\\u043e \\u0420\\u0420\\u0426.", "timestamp": 122.0}, {"speaker": "client", "text": "\\u041d\\u0443 \\u0442\\u043e \\u0435\\u0441\\u0442\\u044c \\u044f \\u0443\\u0436\\u0435 \\u043d\\u0430 6% \\u0437\\u0434\\u0435\\u0441\\u044c \\u0442\\u0435\\u0440\\u044f\\u044e.", "timestamp": 125.0}, {"speaker": "client", "text": "\\u0423 \\u043c\\u0435\\u043d\\u044f \\u0441\\u0434\\u0435\\u043b\\u043a\\u0430 \\u043f\\u043e\\u043b\\u0443\\u0447\\u0430\\u0435\\u0442\\u0441\\u044f \\u0442\\u0430\\u043c, \\u043d\\u0443 \\u0433\\u0440\\u0443\\u0431\\u043e \\u0433\\u043e\\u0432\\u043e\\u0440\\u044f, \\u0442\\u0430\\u043c \\u043e\\u043a\\u043e\\u043b\\u043e \\u043d\\u0443\\u043b\\u0435\\u0432\\u0430\\u044f.", "timestamp": 128.0}, {"speaker": "client", "text": "\\u0422\\u043e\\u043b\\u044c\\u043a\\u043e \\u0434\\u043b\\u044f \\u0442\\u043e\\u0433\\u043e, \\u0447\\u0442\\u043e\\u0431\\u044b \\u043e\\u0441\\u0442\\u0430\\u0432\\u0438\\u0442\\u044c \\u0432\\u0430\\u0441.", "timestamp": 131.0}, {"speaker": "client", "text": "\\u0412\\u044b \\u0442\\u0430\\u043c \\u043f\\u043b\\u044e\\u0441-\\u043c\\u0438\\u043d\\u0443\\u0441 5% \\u0436\\u0435 \\u043c\\u043e\\u0436\\u0435\\u0442\\u0435 \\u043f\\u043e\\u0442\\u043e\\u043c \\u043a\\u0430\\u043a \\u0431\\u044b \\u043f\\u043e\\u0434\\u0432\\u0438\\u043d\\u0443\\u0442\\u044c\\u0441\\u044f.", "timestamp": 135.0}, {"speaker": "client", "text": "\\u041d\\u0443 \\u043f\\u043e\\u0442\\u043e\\u043c\\u0443 \\u0447\\u0442\\u043e \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0432\\u0441\\u0435 \\u0434\\u043e\\u0440\\u043e\\u0436\\u0430\\u0435\\u0442.", "timestamp": 137.0}, {"speaker": "client", "text": "\\u0418 \\u043f\\u043e\\u0434 \\u044d\\u0442\\u0438\\u043c \\u0432\\u043e\\u0442 \\u043a\\u0430\\u043a\\u0438\\u043c-\\u0442\\u043e \\u0442\\u0430\\u043c \\u044d\\u0442\\u0438\\u043c \\u0441\\u043e\\u0443\\u0441\\u043e\\u043c.", "timestamp": 140.0}, {"speaker": "client", "text": "\\u0418 \\u0432\\u043e\\u0442 \\u0432\\u0442\\u043e\\u0440\\u043e\\u0439 \\u043c\\u043e\\u043c\\u0435\\u043d\\u0442.", "timestamp": 141.0}, {"speaker": "client", "text": "\\u042f \\u043f\\u0435\\u0440\\u0435\\u0436\\u0438\\u0432\\u0430\\u044e \\u0437\\u0430 \\u0442\\u043e, \\u0447\\u0442\\u043e \\u0432\\u043e\\u0442, \\u043d\\u0430\\u043f\\u0440\\u0438\\u043c\\u0435\\u0440, \\u043c\\u044b \\u0437\\u0430\\u043a\\u043b\\u044e\\u0447\\u0438\\u043c \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043a\\u043e\\u043d\\u0442\\u0440\\u0430\\u043a\\u0442,", "timestamp": 145.0}, {"speaker": "client", "text": "\\u0430 \\u0443 \\u043c\\u0435\\u043d\\u044f \\u0442\\u0430\\u043c \\u043f\\u043e \\u0441\\u0440\\u043e\\u043a\\u0430\\u043c \\u0431\\u0443\\u0434\\u0443\\u0442 \\u043a\\u0430\\u043a\\u0438\\u0435-\\u0442\\u043e \\u043f\\u0440\\u043e\\u0431\\u043b\\u0435\\u043c\\u044b,", "timestamp": 147.0}, {"speaker": "client", "text": "\\u043f\\u043e\\u0442\\u043e\\u043c\\u0443 \\u0447\\u0442\\u043e \\u0421\\u0430\\u0434\\u043a\\u043e \\u043d\\u0435 \\u043d\\u0430\\u0439\\u0442\\u0438 \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043f\\u043e \\u0432\\u0441\\u0435\\u0439 \\u0441\\u0442\\u0440\\u0430\\u043d\\u0435.", "timestamp": 150.0}, {"speaker": "client", "text": "\\u0418 \\u0410\\u0418\\u0422\\u041a\\u0421, \\u044f \\u043d\\u0435 \\u0437\\u043d\\u0430\\u044e \\u043a\\u0430\\u043a\\u0438\\u043c \\u043e\\u0431\\u0440\\u0430\\u0437\\u043e\\u043c \\u043e\\u043d\\u0438 \\u044d\\u0442\\u043e \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0438\\u043b\\u0438.", "timestamp": 154.0}, {"speaker": "client", "text": "\\u041d\\u0443 \\u0442\\u043e \\u0435\\u0441\\u0442\\u044c \\u0440\\u0430\\u0434\\u0438 \\u0447\\u0435\\u0433\\u043e?", "timestamp": 155.0}, {"speaker": "client", "text": "\\u0422\\u043e\\u043b\\u044c\\u043a\\u043e \\u0434\\u043b\\u044f \\u0442\\u043e\\u0433\\u043e, \\u0447\\u0442\\u043e\\u0431\\u044b \\u0442\\u0430\\u043c \\u0442\\u043e\\u0436\\u0435 \\u0447\\u0442\\u043e \\u043b\\u0438?", "timestamp": 158.0}, {"speaker": "client", "text": "\\u0418 \\u0431\\u043e\\u043b\\u0435\\u0435 2 \\u0435\\u0434\\u0438\\u043d\\u0438\\u0446\\u044b.", "timestamp": 159.0}, {"speaker": "client", "text": "\\u041e\\u043d \\u0442\\u043e\\u0436\\u0435 \\u0432 \\u043a\\u0443\\u0440\\u0441\\u0435, \\u0447\\u0442\\u043e 2 \\u0435\\u0434\\u0438\\u043d\\u0438\\u0446\\u044b.", "timestamp": 161.0}, {"speaker": "client", "text": "\\u041f\\u043e\\u044d\\u0442\\u043e\\u043c\\u0443 \\u0442\\u043e \\u0435\\u0441\\u0442\\u044c \\u043e\\u0434\\u0438\\u043d\\u0430\\u043a\\u043e\\u0432\\u043e\\u0435.", "timestamp": 162.0}, {"speaker": "client", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c \\u044d\\u0442\\u043e \\u0434\\u043b\\u044f \\u0432\\u0441\\u0435\\u0445 \\u0431\\u044b\\u043b\\u043e.", "timestamp": 163.0}, {"speaker": "client", "text": "\\u0412 \\u043e\\u0431\\u0449\\u0435\\u043c \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u044d\\u0442\\u043e \\u0441\\u0434\\u0435\\u043b\\u0430\\u0435\\u043c.", "timestamp": 164.0}, {"speaker": "client", "text": "\\u0410 \\u0432\\u044b \\u0443\\u0441\\u043f\\u0435\\u0432\\u0430\\u0435\\u0442\\u0435 \\u0432 \\u0430\\u043f\\u0440\\u0435\\u043b\\u0435 \\u0437\\u0430\\u043a\\u043b\\u044e\\u0447\\u0438\\u0442\\u044c\\u0441\\u044f \\u0438\\u043b\\u0438 \\u043d\\u0435\\u0442?", "timestamp": 167.0}, {"speaker": "client", "text": "\\u041a\\u0430\\u043a \\u0434\\u0443\\u043c\\u0430\\u0435\\u0442\\u0435?", "timestamp": 169.0}, {"speaker": "client", "text": "\\u042f \\u0434\\u0430\\u0436\\u0435 \\u0434\\u0443\\u043c\\u0430\\u0442\\u044c \\u0437\\u0434\\u0435\\u0441\\u044c \\u043d\\u0435 \\u0431\\u0443\\u0434\\u0443.", "timestamp": 171.0}, {"speaker": "client", "text": "\\u0412\\u0430\\u043c \\u0434\\u0430\\u0436\\u0435 \\u043e\\u0431\\u043d\\u0430\\u0434\\u0435\\u0436\\u0438\\u0432\\u0430\\u0442\\u044c \\u043c\\u043d\\u0435 \\u043d\\u0438\\u0447\\u0435\\u043c.", "timestamp": 173.0}, {"speaker": "client", "text": "\\u041f\\u043e\\u0442\\u043e\\u043c\\u0443 \\u0447\\u0442\\u043e \\u043a\\u0430\\u043a \\u0443 \\u043d\\u0430\\u0441 \\u0432 \\u0430\\u043f\\u0440\\u0435\\u043b\\u0435?", "timestamp": 175.0}, {"speaker": "client", "text": "\\u0412 \\u0430\\u043f\\u0440\\u0435\\u043b\\u0435 \\u0442\\u043e\\u0447\\u043d\\u043e \\u043d\\u0435\\u0442.", "timestamp": 176.0}, {"speaker": "client", "text": "\\u041f\\u043e\\u0442\\u043e\\u043c\\u0443 \\u0447\\u0442\\u043e \\u0443 \\u043d\\u0430\\u0441, \\u043d\\u0443 \\u0441\\u0430\\u043c\\u0438 \\u043f\\u043e\\u043d\\u0438\\u043c\\u0430\\u0435\\u0442\\u0435, \\u043f\\u0440\\u043e\\u0446\\u0435\\u0434\\u0443\\u0440\\u044b \\u0442\\u0430\\u043a\\u0438\\u0435 \\u0447\\u0442\\u043e.", "timestamp": 180.0}, {"speaker": "client", "text": "\\u042f \\u043f\\u043e\\u044d\\u0442\\u043e\\u043c\\u0443 \\u0434\\u0430\\u0436\\u0435 \\u0432\\u0430\\u043c \\u043e\\u0431\\u0435\\u0449\\u0430\\u0442\\u044c \\u043d\\u0438\\u0447\\u0435\\u0433\\u043e \\u043d\\u0435 \\u0431\\u0443\\u0434\\u0443.", "timestamp": 182.0}, {"speaker": "client", "text": "\\u041e\\u043d\\u0438 \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0431\\u0443\\u0434\\u0443\\u0442 \\u0435\\u0449\\u0435 \\u043d\\u0435\\u0434\\u0435\\u043b\\u044e \\u0434\\u0443\\u043c\\u0430\\u0442\\u044c.", "timestamp": 186.0}, {"speaker": "client", "text": "\\u041a\\u043e\\u0440\\u043e\\u0447\\u0435 \\u0442\\u0430\\u043c \\u0432\\u0441\\u0435 \\u043d\\u0430 \\u043c\\u0430\\u0439 \\u043f\\u0435\\u0440\\u0435\\u0439\\u0434\\u0435\\u0442 \\u0438 \\u043d\\u0430\\u043c \\u043f\\u043e\\u0441\\u043b\\u0435 \\u043c\\u0430\\u0439\\u0441\\u043a\\u0438\\u0445 \\u043f\\u0440\\u0430\\u0437\\u0434\\u043d\\u0438\\u043a\\u043e\\u0432.", "timestamp": 189.0}, {"speaker": "client", "text": "\\u041d\\u0443 \\u0434\\u0430, \\u0434\\u0430, \\u0434\\u0430.", "timestamp": 191.0}, {"speaker": "client", "text": "\\u0422\\u0430\\u043a \\u0438 \\u0431\\u0443\\u0434\\u0435\\u0442.", "timestamp": 192.0}, {"speaker": "client", "text": "\\u041b\\u0430\\u0434\\u043d\\u043e.", "timestamp": 193.0}, {"speaker": "client", "text": "\\u0412 \\u043e\\u0431\\u0449\\u0435\\u043c \\u043f\\u043e\\u0448\\u0435\\u043b \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441.", "timestamp": 194.0}, {"speaker": "client", "text": "\\u042f \\u0431\\u0435\\u0437 \\u043f\\u0435\\u0440\\u0435\\u0434\\u0430\\u0447\\u0438 \\u043d\\u0438\\u043a\\u0443\\u0434\\u0430 \\u043d\\u0435 \\u0443\\u0439\\u0434\\u0435\\u0442.", "timestamp": 196.0}, {"speaker": "client", "text": "\\u042f \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043a\\u043e\\u043c\\u043c\\u0435\\u0440\\u0447\\u0435\\u0441\\u043a\\u043e\\u0435 \\u0440\\u0430\\u0441\\u043f\\u0435\\u0447\\u0430\\u0442\\u0430\\u044e.", "timestamp": 198.0}, {"speaker": "client", "text": "\\u041f\\u043e\\u0439\\u0434\\u0443 \\u043a \\u0434\\u0438\\u0440\\u0435\\u043a\\u0442\\u043e\\u0440\\u0443.", "timestamp": 199.0}, {"speaker": "client", "text": "\\u0412\\u0441\\u0435 \\u043e\\u0431\\u044a\\u044f\\u0441\\u043d\\u044e.", "timestamp": 200.0}, {"speaker": "client", "text": "\\u0412\\u043e\\u0442 \\u0445\\u043e\\u0442\\u044f \\u0431\\u044b \\u0443 \\u043c\\u0435\\u043d\\u044f \\u043a\\u0430\\u043a\\u0438\\u0435-\\u0442\\u043e \\u0430\\u0440\\u0433\\u0443\\u043c\\u0435\\u043d\\u0442\\u044b \\u0431\\u0443\\u0434\\u0443\\u0442.", "timestamp": 202.0}, {"speaker": "client", "text": "\\u0411\\u0443\\u0434\\u0435\\u043c \\u0434\\u0443\\u043c\\u0430\\u0442\\u044c \\u0447\\u0442\\u043e \\u0434\\u0435\\u043b\\u0430\\u0442\\u044c.", "timestamp": 203.0}, {"speaker": "client", "text": "\\u0411\\u0435\\u0437 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432.", "timestamp": 204.0}, {"speaker": "client", "text": "\\u0412\\u0441\\u0435 \\u0434\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435.", "timestamp": 205.0}, {"speaker": "client", "text": "\\u042f \\u043f\\u043e\\u0434\\u0435\\u043b\\u0438\\u043b\\u0441\\u044f \\u0441 \\u0432\\u0430\\u043c\\u0438.", "timestamp": 206.0}, {"speaker": "client", "text": "\\u0422\\u0430\\u043c \\u043f\\u0440\\u0438\\u043d\\u0438\\u043c\\u0430\\u0439\\u0442\\u0435 \\u0440\\u0435\\u0448\\u0435\\u043d\\u0438\\u044f.", "timestamp": 207.0}, {"speaker": "client", "text": "\\u0414\\u0430.", "timestamp": 208.0}, {"speaker": "client", "text": "\\u042f \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0432\\u0441\\u0435 \\u0441\\u0434\\u0435\\u043b\\u0430\\u044e.", "timestamp": 209.0}, {"speaker": "client", "text": "\\u042f \\u0443\\u0432\\u0435\\u0440\\u0435\\u043d, \\u0447\\u0442\\u043e \\u043c\\u044b \\u0441 \\u0432\\u0430\\u043c\\u0438 \\u043e\\u0441\\u0442\\u0430\\u043d\\u0435\\u043c\\u0441\\u044f.", "timestamp": 210.0}, {"speaker": "client", "text": "\\u0418 \\u0432\\u044b \\u0441 \\u043d\\u0430\\u043c\\u0438 \\u043e\\u0441\\u0442\\u0430\\u043d\\u0435\\u0442\\u0435\\u0441\\u044c.", "timestamp": 211.0}, {"speaker": "client", "text": "\\u0422\\u0430\\u043a \\u0447\\u0442\\u043e \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u044f \\u043f\\u043e\\u0448\\u0435\\u043b \\u043a \\u0448\\u0435\\u0444\\u0443.", "timestamp": 213.0}, {"speaker": "client", "text": "\\u0412\\u0441\\u0435 \\u0434\\u043e\\u0433\\u043e\\u0432\\u043e\\u0440\\u0438\\u043b\\u0438\\u0441\\u044c.", "timestamp": 214.0}, {"speaker": "client", "text": "\\u041b\\u0430\\u0434\\u043d\\u043e.", "timestamp": 215.0}, {"speaker": "client", "text": "\\u041f\\u043e\\u0437\\u0432\\u043e\\u043d\\u044e \\u0432\\u0430\\u043c \\u0442\\u043e\\u0433\\u0434\\u0430.", "timestamp": 216.0}, {"speaker": "client", "text": "\\u0414\\u0430 \\u0438 \\u0432\\u0430\\u043c \\u0442\\u043e\\u0436\\u0435.", "timestamp": 217.0}], "client_data": {"request": "\\u0441\\u043e\\u0433\\u043b\\u0430\\u0441\\u043e\\u0432\\u0430\\u0442\\u044c \\u0446\\u0435\\u043d\\u0443 \\u0438 \\u0443\\u0441\\u043b\\u043e\\u0432\\u0438\\u044f", "income_source": "\\u043d\\u0435 \\u0443\\u043a\\u0430\\u0437\\u0430\\u043d\\u043e", "age": null, "city": null, "purchase_readiness": "\\u0441\\u0440\\u0435\\u0434\\u043d\\u044f\\u044f", "main_objections": ["\\u0446\\u0435\\u043d\\u0430", "\\u0441\\u0440\\u043e\\u043a\\u0438"], "result_timeline": "\\u043f\\u043e\\u0441\\u043b\\u0435 \\u043c\\u0430\\u0439\\u0441\\u043a\\u0438\\u0445 \\u043f\\u0440\\u0430\\u0437\\u0434\\u043d\\u0438\\u043a\\u043e\\u0432"}}	NON_COMPLIANT	0	40	{"manager_speech_ratio": 40}	["\\u0446\\u0435\\u043d\\u0430", "\\u0441\\u0440\\u043e\\u043a\\u0438", "\\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435", "\\u0434\\u043e\\u0433\\u043e\\u0432\\u043e\\u0440"]	{"count": 2, "types": ["\\u0446\\u0435\\u043d\\u0430", "\\u0441\\u0440\\u043e\\u043a\\u0438"], "handled": true}	upload	\N	2026-07-05 19:16:56.03889+00	2026-07-05 19:18:01.68507+00	2026-07-05 19:18:01.682681+00	20	new_lead	f
50	2	kuporosov_andrey_out_79224680656_2026_06_26-08_52_31_nnka.mp3	/app/uploads/af31b349-ab85-4528-98d4-f2865d747023.mp3	325.2200012207031	ANALYZED	Алло. Добрый день. Меня зовут Андрей. День добрый. Организация спецэффект-пром. Оставили заявку наставить ее на обратный звонок. Да. Подскажите, какая техника заинтересовала вас? Что за какая часть? Еще раз, не расслышал. Алло. Да-да-да, слышно меня? Да, слышно. Подскажите, какая техника заинтересовала вас? Топливозаправщик. Топливозаправщик. На базе у вас, артикул 8010 у вас стоит. 8010, сейчас секунду открою. Подскажите, как могу к вам обращаться, как зовут вас? Рамин, я зовут. Рамин, правильно? Рамин. Рамин. А, 8010. Хорошо. То есть, как на сайте устраивает, полтора куба. На базе у вас профиль полноприводного. С одним тараканом, правильно? С чем еще раз? Ну, с одной топливно-раздачной колонкой. Понял, да-да. А, и бывает с двумя, что ли, у вас? Бывает с двумя. С двумя отсеками? С двумя отсеками, да, совершенно верно. Там получается по... Сейчас скажу сколько. То есть, на различные виды топлива. То есть, на дизель, на светлые нефтепродукты и... Ну, если две секции и две раздачные колонки, то да, можно, соответственно, два раздельно возить. И дизель, и бензин. И дизель, и бензин, понял. Да, то есть, вам две секции нужны или одну? Блин, вообще, шикарно было. Две колонки. Две секции и две колонки, да? Две секции, естественно. Если две секции и одна колонка, то что-то это... Разбавлять. Ну да, там немножко, если две колонки... Одну колонку делаешь, то там немножко пересортится, получается. Спуск пропадает на дизеле. Да, да, совершенно верно. Смотрите, сейчас по наличию таких автомобилей нет. Вам как скорая нужна? Чем быстрее, тем лучше. Я могу подготовить предложение где-то в течение 40 рабочих дней. То есть, это... В течение 40 рабочих дней? То есть, в течение двух месяцев? Это минимум, значит, вы изготавливаете только, да? Да, это полностью. Мы берем шасси удювера, ставим бочку и изготавливаем. И по цене сколько выходит? Я могу посчитать. Давайте еще пару вопросов задам. А вы смотрите еще, подождите. А у вас в наличии есть одним отсеком? Нет, сейчас говорю, что такой техники нет по наличию. Все распродали. Был прям буквально недавно продан. Угу. Вот. А вы уже пользуетесь такой техникой? Нет. Скажите. Нет, да? То есть, а... У вас чем предприятия занимаются? Транспортная компания. Еще раз, транспортная? Транспортная, транспортная. Транспорт. То есть, вы хотите подвозить для своей техники, правильно я понимаю? Для своей, конечно. Хорошо. Рамин, а вы из какого города звоните? Янал. Янал. Ямал-Невский автономный округ. Угу. Смотрите, я подготовлю сейчас предложение. Вот с телефона, который вы звоните, там Макс присутствует у вас? Присутствует. Я сейчас туда визитку уже, наверное, ушла у вас визитка. Ну, моя визитка. Просьба прислать адрес электронной почты. Сейчас я проверю, может быть у меня отразился. Нет, у меня нету адрес электронной почты. Я туда отправлю предложение. Со всеми характеристиками подробными. И стоимостью. Вы подскажите, вам доставка нужна будет? Или вы готовы из Нижнего Города? Ну, надо посмотреть еще. Когда, что. Еще понять бы. Ну, то есть, пока я без доставки считаю. Да, да, да. Без доставки. А вот такой вопрос, как организация у вас называется? Подготовочная. Ну, давайте и производим. Именен могу скинуть, если что. Да, конечно. Карточку предприятия могу скинуть. Да, тогда я сейчас напишу в Максе. Вы скиньте, пожалуйста, мне почту и карточку предприятия. Я вам подготовлю или иное коммерческое предложение. Хорошо. У вас по времени от Московского отличается? Два часа. Два часа. В Москве восемь утра, а у нас десять. Угу. Хорошо. Ну, мы тоже уже работаем. Соответственно, плюс два часа я по месту просто поставлю, чтобы вам поздно не звонить. Постараюсь сегодня, сегодня дня вам подготовить. То есть, еще раз поговорим на УАЗе полноприводном профе. Топливозаправщик. Две хексы, чтобы можно было перевозить, перевозить топливо. И две раздачные колонки, правильно? Да. Все, тогда у вас... А у нас есть какие-то вопросы еще? Нет. Все, тогда... Так, коммерческое отправлю, тоже позвоню, увижу, что это пришло. Все хорошо. До свидания. Все, добро. До свидания.	0.95	large-v3	{"call_type": "new_lead", "warmth": "warm", "criteria_scores": {"greeting": 0.5, "speech": 0.5, "initiative": 0.5, "programming": 0.5, "qualification": 1, "pain": 0.5, "product": 0.5, "expertise": 0.5, "closing": 0.5, "push": 0, "next_step": 1, "framing": 0.5}, "criteria_details": {"greeting": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043f\\u0440\\u0435\\u0434\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0441\\u044f, \\u043d\\u043e \\u043d\\u0435 \\u043d\\u0430\\u0437\\u0432\\u0430\\u043b \\u0446\\u0435\\u043b\\u044c \\u0437\\u0432\\u043e\\u043d\\u043a\\u0430 \\u0438 \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044e, \\u0447\\u0442\\u043e \\u0434\\u0435\\u043b\\u0430\\u0435\\u0442 \\u043f\\u0440\\u0438\\u0432\\u0435\\u0442\\u0441\\u0442\\u0432\\u0438\\u0435 \\u043d\\u0435\\u043f\\u043e\\u043b\\u043d\\u044b\\u043c.", "speech": "\\u0420\\u0435\\u0447\\u044c \\u043c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440\\u0430 \\u0431\\u044b\\u043b\\u0430 \\u043d\\u0435 \\u0441\\u043e\\u0432\\u0441\\u0435\\u043c \\u0447\\u0435\\u0442\\u043a\\u043e\\u0439, \\u043f\\u0440\\u0438\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u043e\\u0432\\u0430\\u043b\\u0438 \\u043f\\u0430\\u0443\\u0437\\u044b \\u0438 \\u043d\\u0435 \\u0432\\u0441\\u0435\\u0433\\u0434\\u0430 \\u044f\\u0441\\u043d\\u044b\\u0435 \\u0444\\u043e\\u0440\\u043c\\u0443\\u043b\\u0438\\u0440\\u043e\\u0432\\u043a\\u0438.", "initiative": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u0438\\u043d\\u043e\\u0433\\u0434\\u0430 \\u0437\\u0430\\u0434\\u0430\\u0432\\u0430\\u043b \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b, \\u043d\\u043e \\u043d\\u0435 \\u0432\\u0441\\u0435\\u0433\\u0434\\u0430 \\u0430\\u043a\\u0442\\u0438\\u0432\\u043d\\u043e \\u0443\\u043f\\u0440\\u0430\\u0432\\u043b\\u044f\\u043b \\u0434\\u0438\\u0430\\u043b\\u043e\\u0433\\u043e\\u043c.", "programming": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u0437\\u0430\\u0434\\u0430\\u0432\\u0430\\u043b \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b, \\u043d\\u043e \\u043d\\u0435 \\u0432\\u0441\\u0435\\u0433\\u0434\\u0430 \\u0437\\u0430\\u0432\\u0435\\u0440\\u0448\\u0430\\u043b \\u0438\\u0445 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u043e\\u043c, \\u0447\\u0442\\u043e \\u0441\\u043d\\u0438\\u0436\\u0430\\u0435\\u0442 \\u044d\\u0444\\u0444\\u0435\\u043a\\u0442\\u0438\\u0432\\u043d\\u043e\\u0441\\u0442\\u044c.", "qualification": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u0437\\u0430\\u0434\\u0430\\u0432\\u0430\\u043b \\u0434\\u043e\\u0441\\u0442\\u0430\\u0442\\u043e\\u0447\\u043d\\u043e \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432 \\u0434\\u043b\\u044f \\u0432\\u044b\\u044f\\u0432\\u043b\\u0435\\u043d\\u0438\\u044f \\u043f\\u043e\\u0442\\u0440\\u0435\\u0431\\u043d\\u043e\\u0441\\u0442\\u0435\\u0439 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430.", "pain": "\\u041d\\u0435\\u043a\\u043e\\u0442\\u043e\\u0440\\u044b\\u0435 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b \\u043e \\u0431\\u043e\\u043b\\u0438 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430 \\u0431\\u044b\\u043b\\u0438 \\u0437\\u0430\\u0434\\u0430\\u043d\\u044b, \\u043d\\u043e \\u043d\\u0435 \\u0432\\u0441\\u0435 \\u0430\\u0441\\u043f\\u0435\\u043a\\u0442\\u044b \\u0431\\u044b\\u043b\\u0438 \\u043e\\u0445\\u0432\\u0430\\u0447\\u0435\\u043d\\u044b.", "product": "\\u041f\\u0440\\u0435\\u0437\\u0435\\u043d\\u0442\\u0430\\u0446\\u0438\\u044f \\u043f\\u0440\\u043e\\u0434\\u0443\\u043a\\u0442\\u0430 \\u0431\\u044b\\u043b\\u0430 \\u0444\\u043e\\u0440\\u043c\\u0430\\u043b\\u044c\\u043d\\u043e\\u0439 \\u0438 \\u043d\\u0435 \\u0432\\u0441\\u0435\\u0433\\u0434\\u0430 \\u043f\\u0440\\u0438\\u0432\\u044f\\u0437\\u0430\\u043d\\u0430 \\u043a \\u043f\\u043e\\u0442\\u0440\\u0435\\u0431\\u043d\\u043e\\u0441\\u0442\\u044f\\u043c \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430.", "expertise": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043e\\u0442\\u0432\\u0435\\u0447\\u0430\\u043b \\u0443\\u0432\\u0435\\u0440\\u0435\\u043d\\u043d\\u043e, \\u043d\\u043e \\u043d\\u0435 \\u043d\\u0430 \\u0432\\u0441\\u0435 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430.", "closing": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u0438\\u043b \\u043a\\u043e\\u043c\\u043c\\u0435\\u0440\\u0447\\u0435\\u0441\\u043a\\u043e\\u0435 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435, \\u043d\\u043e \\u043d\\u0435 \\u0437\\u0430\\u043a\\u0440\\u044b\\u043b \\u0441\\u0434\\u0435\\u043b\\u043a\\u0443 \\u0438\\u043b\\u0438 \\u043d\\u0435 \\u043d\\u0430\\u0437\\u043d\\u0430\\u0447\\u0438\\u043b \\u0432\\u0441\\u0442\\u0440\\u0435\\u0447\\u0443.", "push": "\\u041d\\u0435 \\u0431\\u044b\\u043b\\u043e \\u043e\\u0442\\u0440\\u0430\\u0431\\u043e\\u0442\\u043a\\u0438 \\u0432\\u043e\\u0437\\u0440\\u0430\\u0436\\u0435\\u043d\\u0438\\u0439 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430.", "next_step": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u0447\\u0435\\u0442\\u043a\\u043e \\u043d\\u0430\\u0437\\u043d\\u0430\\u0447\\u0438\\u043b \\u0441\\u043b\\u0435\\u0434\\u0443\\u044e\\u0449\\u0438\\u0439 \\u0448\\u0430\\u0433 \\u2014 \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043a\\u0443 \\u043a\\u043e\\u043c\\u043c\\u0435\\u0440\\u0447\\u0435\\u0441\\u043a\\u043e\\u0433\\u043e \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u044f.", "framing": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043f\\u043e\\u0434\\u0441\\u0442\\u0440\\u0430\\u0438\\u0432\\u0430\\u043b\\u0441\\u044f \\u043f\\u043e\\u0434 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430, \\u043d\\u043e \\u0438\\u043d\\u043e\\u0433\\u0434\\u0430 \\u0432\\u043e\\u0437\\u043d\\u0438\\u043a\\u0430\\u043b\\u0438 \\u043d\\u0435\\u0434\\u043e\\u043f\\u043e\\u043d\\u0438\\u043c\\u0430\\u043d\\u0438\\u044f."}, "fg_score": 54.17, "objection_count": 0, "objection_types": [], "manager_tone": "neutral", "client_tone": "interested", "crm_quality": 0, "compliance": {"score": 75, "level": "partial", "details": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u0432\\u044b\\u043f\\u043e\\u043b\\u043d\\u0438\\u043b \\u0431\\u043e\\u043b\\u044c\\u0448\\u0443\\u044e \\u0447\\u0430\\u0441\\u0442\\u044c \\u043a\\u0440\\u0438\\u0442\\u0435\\u0440\\u0438\\u0435\\u0432, \\u043d\\u043e \\u0435\\u0441\\u0442\\u044c \\u043d\\u0435\\u0434\\u043e\\u0441\\u0442\\u0430\\u0442\\u043a\\u0438 \\u0432 \\u043f\\u0440\\u0438\\u0432\\u0435\\u0442\\u0441\\u0442\\u0432\\u0438\\u0438, \\u043e\\u0442\\u0440\\u0430\\u0431\\u043e\\u0442\\u043a\\u0435 \\u0432\\u043e\\u0437\\u0440\\u0430\\u0436\\u0435\\u043d\\u0438\\u0439 \\u0438 \\u0437\\u0430\\u043a\\u0440\\u044b\\u0442\\u0438\\u0438."}, "summary": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043f\\u0440\\u043e\\u0432\\u0435\\u043b \\u0437\\u0432\\u043e\\u043d\\u043e\\u043a, \\u0432\\u044b\\u044f\\u0432\\u0438\\u043b \\u043f\\u043e\\u0442\\u0440\\u0435\\u0431\\u043d\\u043e\\u0441\\u0442\\u0438 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430 \\u0438 \\u043f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u0438\\u043b \\u043a\\u043e\\u043c\\u043c\\u0435\\u0440\\u0447\\u0435\\u0441\\u043a\\u043e\\u0435 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435, \\u043d\\u043e \\u043d\\u0435 \\u0437\\u0430\\u043a\\u0440\\u044b\\u043b \\u0441\\u0434\\u0435\\u043b\\u043a\\u0443 \\u0438 \\u043d\\u0435 \\u043e\\u0442\\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u043b \\u0432\\u043e\\u0437\\u0440\\u0430\\u0436\\u0435\\u043d\\u0438\\u044f. \\u0420\\u0435\\u043a\\u043e\\u043c\\u0435\\u043d\\u0434\\u0443\\u0435\\u0442\\u0441\\u044f \\u0443\\u043b\\u0443\\u0447\\u0448\\u0438\\u0442\\u044c \\u0441\\u0442\\u0440\\u0443\\u043a\\u0442\\u0443\\u0440\\u0443 \\u0440\\u0435\\u0447\\u0438 \\u0438 \\u0430\\u043a\\u0442\\u0438\\u0432\\u043d\\u043e\\u0441\\u0442\\u044c \\u0432 \\u0443\\u043f\\u0440\\u0430\\u0432\\u043b\\u0435\\u043d\\u0438\\u0438 \\u0434\\u0438\\u0430\\u043b\\u043e\\u0433\\u043e\\u043c.", "strengths": ["\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043f\\u0440\\u043e\\u044f\\u0432\\u0438\\u043b \\u0438\\u043d\\u0442\\u0435\\u0440\\u0435\\u0441 \\u043a \\u043f\\u043e\\u0442\\u0440\\u0435\\u0431\\u043d\\u043e\\u0441\\u0442\\u044f\\u043c \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430 \\u0438 \\u0437\\u0430\\u0434\\u0430\\u0432\\u0430\\u043b \\u0443\\u0442\\u043e\\u0447\\u043d\\u044f\\u044e\\u0449\\u0438\\u0435 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b.", "\\u0427\\u0435\\u0442\\u043a\\u043e \\u043e\\u0431\\u043e\\u0437\\u043d\\u0430\\u0447\\u0438\\u043b \\u0441\\u043b\\u0435\\u0434\\u0443\\u044e\\u0449\\u0438\\u0439 \\u0448\\u0430\\u0433 \\u2014 \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043a\\u0443 \\u043a\\u043e\\u043c\\u043c\\u0435\\u0440\\u0447\\u0435\\u0441\\u043a\\u043e\\u0433\\u043e \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u044f."], "growth_areas": ["\\u0423\\u043b\\u0443\\u0447\\u0448\\u0438\\u0442\\u044c \\u043f\\u0440\\u0438\\u0432\\u0435\\u0442\\u0441\\u0442\\u0432\\u0438\\u0435, \\u0434\\u043e\\u0431\\u0430\\u0432\\u0438\\u0432 \\u0438\\u043d\\u0444\\u043e\\u0440\\u043c\\u0430\\u0446\\u0438\\u044e \\u043e \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u0438 \\u0438 \\u0446\\u0435\\u043b\\u0438 \\u0437\\u0432\\u043e\\u043d\\u043a\\u0430, \\u043d\\u0430\\u043f\\u0440\\u0438\\u043c\\u0435\\u0440: '\\u042f \\u043f\\u0440\\u0435\\u0434\\u0441\\u0442\\u0430\\u0432\\u043b\\u044f\\u044e \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044e X \\u0438 \\u0437\\u0432\\u043e\\u043d\\u044e, \\u0447\\u0442\\u043e\\u0431\\u044b \\u043e\\u0431\\u0441\\u0443\\u0434\\u0438\\u0442\\u044c \\u0432\\u0430\\u0448\\u0443 \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443.'", "\\u0420\\u0430\\u0431\\u043e\\u0442\\u0430\\u0442\\u044c \\u043d\\u0430\\u0434 \\u043e\\u0442\\u0440\\u0430\\u0431\\u043e\\u0442\\u043a\\u043e\\u0439 \\u0432\\u043e\\u0437\\u0440\\u0430\\u0436\\u0435\\u043d\\u0438\\u0439, \\u043d\\u0430\\u043f\\u0440\\u0438\\u043c\\u0435\\u0440, \\u0444\\u0440\\u0430\\u0437\\u043e\\u0439: '\\u042f \\u043f\\u043e\\u043d\\u0438\\u043c\\u0430\\u044e \\u0432\\u0430\\u0448\\u0438 \\u043e\\u043f\\u0430\\u0441\\u0435\\u043d\\u0438\\u044f, \\u0434\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435 \\u043e\\u0431\\u0441\\u0443\\u0434\\u0438\\u043c, \\u043a\\u0430\\u043a \\u043c\\u044b \\u043c\\u043e\\u0436\\u0435\\u043c \\u044d\\u0442\\u043e \\u0440\\u0435\\u0448\\u0438\\u0442\\u044c.'", "\\u0423\\u043b\\u0443\\u0447\\u0448\\u0438\\u0442\\u044c \\u0437\\u0430\\u0432\\u0435\\u0440\\u0448\\u0435\\u043d\\u0438\\u0435 \\u0440\\u0430\\u0437\\u0433\\u043e\\u0432\\u043e\\u0440\\u0430, \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0438\\u0432 \\u043a\\u043e\\u043d\\u043a\\u0440\\u0435\\u0442\\u043d\\u043e\\u0435 \\u0432\\u0440\\u0435\\u043c\\u044f \\u0434\\u043b\\u044f \\u0441\\u043b\\u0435\\u0434\\u0443\\u044e\\u0449\\u0435\\u0433\\u043e \\u043a\\u043e\\u043d\\u0442\\u0430\\u043a\\u0442\\u0430."], "keywords_found": ["\\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u0430", "\\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a", "\\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435"], "emotions": {"manager_speech_ratio": 65.7}, "conversation": [{"speaker": "client", "text": "\\u0410\\u043b\\u043b\\u043e.", "timestamp": 0.0}, {"speaker": "manager", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c. \\u041c\\u0435\\u043d\\u044f \\u0437\\u043e\\u0432\\u0443\\u0442 \\u0410\\u043d\\u0434\\u0440\\u0435\\u0439.", "timestamp": 2.0}, {"speaker": "client", "text": "\\u0414\\u0435\\u043d\\u044c \\u0434\\u043e\\u0431\\u0440\\u044b\\u0439.", "timestamp": 4.0}, {"speaker": "manager", "text": "\\u041e\\u0440\\u0433\\u0430\\u043d\\u0438\\u0437\\u0430\\u0446\\u0438\\u044f \\u0441\\u043f\\u0435\\u0446\\u044d\\u0444\\u0444\\u0435\\u043a\\u0442-\\u043f\\u0440\\u043e\\u043c.", "timestamp": 5.0}, {"speaker": "manager", "text": "\\u041e\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0438 \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443 \\u043d\\u0430\\u0441\\u0442\\u0430\\u0432\\u0438\\u0442\\u044c \\u0435\\u0435 \\u043d\\u0430 \\u043e\\u0431\\u0440\\u0430\\u0442\\u043d\\u044b\\u0439 \\u0437\\u0432\\u043e\\u043d\\u043e\\u043a.", "timestamp": 7.0}, {"speaker": "client", "text": "\\u0414\\u0430.", "timestamp": 9.0}, {"speaker": "manager", "text": "\\u041f\\u043e\\u0434\\u0441\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435, \\u043a\\u0430\\u043a\\u0430\\u044f \\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u0430 \\u0437\\u0430\\u0438\\u043d\\u0442\\u0435\\u0440\\u0435\\u0441\\u043e\\u0432\\u0430\\u043b\\u0430 \\u0432\\u0430\\u0441?", "timestamp": 10.0}, {"speaker": "client", "text": "\\u0427\\u0442\\u043e \\u0437\\u0430 \\u043a\\u0430\\u043a\\u0430\\u044f \\u0447\\u0430\\u0441\\u0442\\u044c?", "timestamp": 14.0}, {"speaker": "manager", "text": "\\u0415\\u0449\\u0435 \\u0440\\u0430\\u0437, \\u043d\\u0435 \\u0440\\u0430\\u0441\\u0441\\u043b\\u044b\\u0448\\u0430\\u043b.", "timestamp": 16.0}, {"speaker": "client", "text": "\\u0410\\u043b\\u043b\\u043e.", "timestamp": 19.0}, {"speaker": "manager", "text": "\\u0414\\u0430-\\u0434\\u0430-\\u0434\\u0430, \\u0441\\u043b\\u044b\\u0448\\u043d\\u043e \\u043c\\u0435\\u043d\\u044f?", "timestamp": 20.0}, {"speaker": "client", "text": "\\u0414\\u0430, \\u0441\\u043b\\u044b\\u0448\\u043d\\u043e.", "timestamp": 22.0}, {"speaker": "manager", "text": "\\u041f\\u043e\\u0434\\u0441\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435, \\u043a\\u0430\\u043a\\u0430\\u044f \\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u0430 \\u0437\\u0430\\u0438\\u043d\\u0442\\u0435\\u0440\\u0435\\u0441\\u043e\\u0432\\u0430\\u043b\\u0430 \\u0432\\u0430\\u0441?", "timestamp": 24.0}, {"speaker": "client", "text": "\\u0422\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a.", "timestamp": 28.0}, {"speaker": "client", "text": "\\u0422\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a.", "timestamp": 31.0}, {"speaker": "client", "text": "\\u041d\\u0430 \\u0431\\u0430\\u0437\\u0435 \\u0443 \\u0432\\u0430\\u0441, \\u0430\\u0440\\u0442\\u0438\\u043a\\u0443\\u043b 8010 \\u0443 \\u0432\\u0430\\u0441 \\u0441\\u0442\\u043e\\u0438\\u0442.", "timestamp": 33.0}, {"speaker": "manager", "text": "8010, \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0441\\u0435\\u043a\\u0443\\u043d\\u0434\\u0443 \\u043e\\u0442\\u043a\\u0440\\u043e\\u044e.", "timestamp": 38.0}, {"speaker": "manager", "text": "\\u041f\\u043e\\u0434\\u0441\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435, \\u043a\\u0430\\u043a \\u043c\\u043e\\u0433\\u0443 \\u043a \\u0432\\u0430\\u043c \\u043e\\u0431\\u0440\\u0430\\u0449\\u0430\\u0442\\u044c\\u0441\\u044f, \\u043a\\u0430\\u043a \\u0437\\u043e\\u0432\\u0443\\u0442 \\u0432\\u0430\\u0441?", "timestamp": 41.0}, {"speaker": "client", "text": "\\u0420\\u0430\\u043c\\u0438\\u043d, \\u044f \\u0437\\u043e\\u0432\\u0443\\u0442.", "timestamp": 44.0}, {"speaker": "manager", "text": "\\u0420\\u0430\\u043c\\u0438\\u043d, \\u043f\\u0440\\u0430\\u0432\\u0438\\u043b\\u044c\\u043d\\u043e?", "timestamp": 45.0}, {"speaker": "client", "text": "\\u0420\\u0430\\u043c\\u0438\\u043d.", "timestamp": 47.0}, {"speaker": "client", "text": "\\u0420\\u0430\\u043c\\u0438\\u043d.", "timestamp": 49.0}, {"speaker": "manager", "text": "\\u0410, 8010.", "timestamp": 51.0}, {"speaker": "manager", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e.", "timestamp": 54.0}, {"speaker": "manager", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u043a\\u0430\\u043a \\u043d\\u0430 \\u0441\\u0430\\u0439\\u0442\\u0435 \\u0443\\u0441\\u0442\\u0440\\u0430\\u0438\\u0432\\u0430\\u0435\\u0442, \\u043f\\u043e\\u043b\\u0442\\u043e\\u0440\\u0430 \\u043a\\u0443\\u0431\\u0430.", "timestamp": 55.0}, {"speaker": "manager", "text": "\\u041d\\u0430 \\u0431\\u0430\\u0437\\u0435 \\u0443 \\u0432\\u0430\\u0441 \\u043f\\u0440\\u043e\\u0444\\u0438\\u043b\\u044c \\u043f\\u043e\\u043b\\u043d\\u043e\\u043f\\u0440\\u0438\\u0432\\u043e\\u0434\\u043d\\u043e\\u0433\\u043e.", "timestamp": 58.0}, {"speaker": "manager", "text": "\\u0421 \\u043e\\u0434\\u043d\\u0438\\u043c \\u0442\\u0430\\u0440\\u0430\\u043a\\u0430\\u043d\\u043e\\u043c, \\u043f\\u0440\\u0430\\u0432\\u0438\\u043b\\u044c\\u043d\\u043e?", "timestamp": 61.0}, {"speaker": "client", "text": "\\u0421 \\u0447\\u0435\\u043c \\u0435\\u0449\\u0435 \\u0440\\u0430\\u0437?", "timestamp": 64.0}, {"speaker": "manager", "text": "\\u041d\\u0443, \\u0441 \\u043e\\u0434\\u043d\\u043e\\u0439 \\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u043d\\u043e-\\u0440\\u0430\\u0437\\u0434\\u0430\\u0447\\u043d\\u043e\\u0439 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u043e\\u0439.", "timestamp": 66.0}, {"speaker": "client", "text": "\\u041f\\u043e\\u043d\\u044f\\u043b, \\u0434\\u0430-\\u0434\\u0430.", "timestamp": 68.0}, {"speaker": "manager", "text": "\\u0410, \\u0438 \\u0431\\u044b\\u0432\\u0430\\u0435\\u0442 \\u0441 \\u0434\\u0432\\u0443\\u043c\\u044f, \\u0447\\u0442\\u043e \\u043b\\u0438, \\u0443 \\u0432\\u0430\\u0441?", "timestamp": 71.0}, {"speaker": "client", "text": "\\u0411\\u044b\\u0432\\u0430\\u0435\\u0442 \\u0441 \\u0434\\u0432\\u0443\\u043c\\u044f.", "timestamp": 74.0}, {"speaker": "manager", "text": "\\u0421 \\u0434\\u0432\\u0443\\u043c\\u044f \\u043e\\u0442\\u0441\\u0435\\u043a\\u0430\\u043c\\u0438?", "timestamp": 75.0}, {"speaker": "client", "text": "\\u0421 \\u0434\\u0432\\u0443\\u043c\\u044f \\u043e\\u0442\\u0441\\u0435\\u043a\\u0430\\u043c\\u0438, \\u0434\\u0430, \\u0441\\u043e\\u0432\\u0435\\u0440\\u0448\\u0435\\u043d\\u043d\\u043e \\u0432\\u0435\\u0440\\u043d\\u043e.", "timestamp": 76.0}, {"speaker": "manager", "text": "\\u0422\\u0430\\u043c \\u043f\\u043e\\u043b\\u0443\\u0447\\u0430\\u0435\\u0442\\u0441\\u044f \\u043f\\u043e...", "timestamp": 78.0}, {"speaker": "manager", "text": "\\u0421\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0441\\u043a\\u0430\\u0436\\u0443 \\u0441\\u043a\\u043e\\u043b\\u044c\\u043a\\u043e.", "timestamp": 80.0}, {"speaker": "manager", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u043d\\u0430 \\u0440\\u0430\\u0437\\u043b\\u0438\\u0447\\u043d\\u044b\\u0435 \\u0432\\u0438\\u0434\\u044b \\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u0430.", "timestamp": 82.0}, {"speaker": "manager", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u043d\\u0430 \\u0434\\u0438\\u0437\\u0435\\u043b\\u044c, \\u043d\\u0430 \\u0441\\u0432\\u0435\\u0442\\u043b\\u044b\\u0435 \\u043d\\u0435\\u0444\\u0442\\u0435\\u043f\\u0440\\u043e\\u0434\\u0443\\u043a\\u0442\\u044b \\u0438...", "timestamp": 85.0}, {"speaker": "manager", "text": "\\u041d\\u0443, \\u0435\\u0441\\u043b\\u0438 \\u0434\\u0432\\u0435 \\u0441\\u0435\\u043a\\u0446\\u0438\\u0438 \\u0438 \\u0434\\u0432\\u0435 \\u0440\\u0430\\u0437\\u0434\\u0430\\u0447\\u043d\\u044b\\u0435 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0438,", "timestamp": 88.0}, {"speaker": "manager", "text": "\\u0442\\u043e \\u0434\\u0430, \\u043c\\u043e\\u0436\\u043d\\u043e, \\u0441\\u043e\\u043e\\u0442\\u0432\\u0435\\u0442\\u0441\\u0442\\u0432\\u0435\\u043d\\u043d\\u043e, \\u0434\\u0432\\u0430 \\u0440\\u0430\\u0437\\u0434\\u0435\\u043b\\u044c\\u043d\\u043e \\u0432\\u043e\\u0437\\u0438\\u0442\\u044c.", "timestamp": 92.0}, {"speaker": "manager", "text": "\\u0418 \\u0434\\u0438\\u0437\\u0435\\u043b\\u044c, \\u0438 \\u0431\\u0435\\u043d\\u0437\\u0438\\u043d.", "timestamp": 95.0}, {"speaker": "client", "text": "\\u0418 \\u0434\\u0438\\u0437\\u0435\\u043b\\u044c, \\u0438 \\u0431\\u0435\\u043d\\u0437\\u0438\\u043d, \\u043f\\u043e\\u043d\\u044f\\u043b.", "timestamp": 97.0}, {"speaker": "manager", "text": "\\u0414\\u0430, \\u0442\\u043e \\u0435\\u0441\\u0442\\u044c, \\u0432\\u0430\\u043c \\u0434\\u0432\\u0435 \\u0441\\u0435\\u043a\\u0446\\u0438\\u0438 \\u043d\\u0443\\u0436\\u043d\\u044b \\u0438\\u043b\\u0438 \\u043e\\u0434\\u043d\\u0443?", "timestamp": 99.0}, {"speaker": "client", "text": "\\u0411\\u043b\\u0438\\u043d, \\u0432\\u043e\\u043e\\u0431\\u0449\\u0435, \\u0448\\u0438\\u043a\\u0430\\u0440\\u043d\\u043e \\u0431\\u044b\\u043b\\u043e.", "timestamp": 103.0}, {"speaker": "client", "text": "\\u0414\\u0432\\u0435 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0438.", "timestamp": 106.0}, {"speaker": "manager", "text": "\\u0414\\u0432\\u0435 \\u0441\\u0435\\u043a\\u0446\\u0438\\u0438 \\u0438 \\u0434\\u0432\\u0435 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0438, \\u0434\\u0430?", "timestamp": 109.0}, {"speaker": "client", "text": "\\u0414\\u0432\\u0435 \\u0441\\u0435\\u043a\\u0446\\u0438\\u0438, \\u0435\\u0441\\u0442\\u0435\\u0441\\u0442\\u0432\\u0435\\u043d\\u043d\\u043e.", "timestamp": 111.0}, {"speaker": "manager", "text": "\\u0415\\u0441\\u043b\\u0438 \\u0434\\u0432\\u0435 \\u0441\\u0435\\u043a\\u0446\\u0438\\u0438 \\u0438 \\u043e\\u0434\\u043d\\u0430 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0430, \\u0442\\u043e \\u0447\\u0442\\u043e-\\u0442\\u043e \\u044d\\u0442\\u043e...", "timestamp": 113.0}, {"speaker": "manager", "text": "\\u0420\\u0430\\u0437\\u0431\\u0430\\u0432\\u043b\\u044f\\u0442\\u044c.", "timestamp": 116.0}, {"speaker": "client", "text": "\\u041d\\u0443 \\u0434\\u0430, \\u0442\\u0430\\u043c \\u043d\\u0435\\u043c\\u043d\\u043e\\u0436\\u043a\\u043e, \\u0435\\u0441\\u043b\\u0438 \\u0434\\u0432\\u0435 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0438...", "timestamp": 118.0}, {"speaker": "manager", "text": "\\u041e\\u0434\\u043d\\u0443 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0443 \\u0434\\u0435\\u043b\\u0430\\u0435\\u0448\\u044c, \\u0442\\u043e \\u0442\\u0430\\u043c \\u043d\\u0435\\u043c\\u043d\\u043e\\u0436\\u043a\\u043e \\u043f\\u0435\\u0440\\u0435\\u0441\\u043e\\u0440\\u0442\\u0438\\u0442\\u0441\\u044f, \\u043f\\u043e\\u043b\\u0443\\u0447\\u0430\\u0435\\u0442\\u0441\\u044f.", "timestamp": 120.0}, {"speaker": "manager", "text": "\\u0421\\u043f\\u0443\\u0441\\u043a \\u043f\\u0440\\u043e\\u043f\\u0430\\u0434\\u0430\\u0435\\u0442 \\u043d\\u0430 \\u0434\\u0438\\u0437\\u0435\\u043b\\u0435.", "timestamp": 124.0}, {"speaker": "client", "text": "\\u0414\\u0430, \\u0434\\u0430, \\u0441\\u043e\\u0432\\u0435\\u0440\\u0448\\u0435\\u043d\\u043d\\u043e \\u0432\\u0435\\u0440\\u043d\\u043e.", "timestamp": 128.0}, {"speaker": "manager", "text": "\\u0421\\u043c\\u043e\\u0442\\u0440\\u0438\\u0442\\u0435, \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043f\\u043e \\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u044e \\u0442\\u0430\\u043a\\u0438\\u0445 \\u0430\\u0432\\u0442\\u043e\\u043c\\u043e\\u0431\\u0438\\u043b\\u0435\\u0439 \\u043d\\u0435\\u0442.", "timestamp": 130.0}, {"speaker": "manager", "text": "\\u0412\\u0430\\u043c \\u043a\\u0430\\u043a \\u0441\\u043a\\u043e\\u0440\\u0430\\u044f \\u043d\\u0443\\u0436\\u043d\\u0430?", "timestamp": 133.0}, {"speaker": "client", "text": "\\u0427\\u0435\\u043c \\u0431\\u044b\\u0441\\u0442\\u0440\\u0435\\u0435, \\u0442\\u0435\\u043c \\u043b\\u0443\\u0447\\u0448\\u0435.", "timestamp": 135.0}, {"speaker": "manager", "text": "\\u042f \\u043c\\u043e\\u0433\\u0443 \\u043f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u0438\\u0442\\u044c \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435 \\u0433\\u0434\\u0435-\\u0442\\u043e \\u0432 \\u0442\\u0435\\u0447\\u0435\\u043d\\u0438\\u0435 40 \\u0440\\u0430\\u0431\\u043e\\u0447\\u0438\\u0445 \\u0434\\u043d\\u0435\\u0439.", "timestamp": 139.0}, {"speaker": "client", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u044d\\u0442\\u043e...", "timestamp": 143.0}, {"speaker": "client", "text": "\\u0412 \\u0442\\u0435\\u0447\\u0435\\u043d\\u0438\\u0435 40 \\u0440\\u0430\\u0431\\u043e\\u0447\\u0438\\u0445 \\u0434\\u043d\\u0435\\u0439?", "timestamp": 145.0}, {"speaker": "client", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u0432 \\u0442\\u0435\\u0447\\u0435\\u043d\\u0438\\u0435 \\u0434\\u0432\\u0443\\u0445 \\u043c\\u0435\\u0441\\u044f\\u0446\\u0435\\u0432?", "timestamp": 147.0}, {"speaker": "client", "text": "\\u042d\\u0442\\u043e \\u043c\\u0438\\u043d\\u0438\\u043c\\u0443\\u043c, \\u0437\\u043d\\u0430\\u0447\\u0438\\u0442, \\u0432\\u044b \\u0438\\u0437\\u0433\\u043e\\u0442\\u0430\\u0432\\u043b\\u0438\\u0432\\u0430\\u0435\\u0442\\u0435 \\u0442\\u043e\\u043b\\u044c\\u043a\\u043e, \\u0434\\u0430?", "timestamp": 149.0}, {"speaker": "manager", "text": "\\u0414\\u0430, \\u044d\\u0442\\u043e \\u043f\\u043e\\u043b\\u043d\\u043e\\u0441\\u0442\\u044c\\u044e. \\u041c\\u044b \\u0431\\u0435\\u0440\\u0435\\u043c \\u0448\\u0430\\u0441\\u0441\\u0438 \\u0443\\u0434\\u044e\\u0432\\u0435\\u0440\\u0430, \\u0441\\u0442\\u0430\\u0432\\u0438\\u043c \\u0431\\u043e\\u0447\\u043a\\u0443 \\u0438 \\u0438\\u0437\\u0433\\u043e\\u0442\\u0430\\u0432\\u043b\\u0438\\u0432\\u0430\\u0435\\u043c.", "timestamp": 152.0}, {"speaker": "client", "text": "\\u0418 \\u043f\\u043e \\u0446\\u0435\\u043d\\u0435 \\u0441\\u043a\\u043e\\u043b\\u044c\\u043a\\u043e \\u0432\\u044b\\u0445\\u043e\\u0434\\u0438\\u0442?", "timestamp": 158.0}, {"speaker": "manager", "text": "\\u042f \\u043c\\u043e\\u0433\\u0443 \\u043f\\u043e\\u0441\\u0447\\u0438\\u0442\\u0430\\u0442\\u044c. \\u0414\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435 \\u0435\\u0449\\u0435 \\u043f\\u0430\\u0440\\u0443 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432 \\u0437\\u0430\\u0434\\u0430\\u043c.", "timestamp": 161.0}, {"speaker": "client", "text": "\\u0410 \\u0432\\u044b \\u0441\\u043c\\u043e\\u0442\\u0440\\u0438\\u0442\\u0435 \\u0435\\u0449\\u0435, \\u043f\\u043e\\u0434\\u043e\\u0436\\u0434\\u0438\\u0442\\u0435.", "timestamp": 164.0}, {"speaker": "manager", "text": "\\u0410 \\u0443 \\u0432\\u0430\\u0441 \\u0432 \\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u0438 \\u0435\\u0441\\u0442\\u044c \\u043e\\u0434\\u043d\\u0438\\u043c \\u043e\\u0442\\u0441\\u0435\\u043a\\u043e\\u043c?", "timestamp": 166.0}, {"speaker": "client", "text": "\\u041d\\u0435\\u0442, \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0433\\u043e\\u0432\\u043e\\u0440\\u044e, \\u0447\\u0442\\u043e \\u0442\\u0430\\u043a\\u043e\\u0439 \\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u0438 \\u043d\\u0435\\u0442 \\u043f\\u043e \\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u044e. \\u0412\\u0441\\u0435 \\u0440\\u0430\\u0441\\u043f\\u0440\\u043e\\u0434\\u0430\\u043b\\u0438.", "timestamp": 169.0}, {"speaker": "client", "text": "\\u0411\\u044b\\u043b \\u043f\\u0440\\u044f\\u043c \\u0431\\u0443\\u043a\\u0432\\u0430\\u043b\\u044c\\u043d\\u043e \\u043d\\u0435\\u0434\\u0430\\u0432\\u043d\\u043e \\u043f\\u0440\\u043e\\u0434\\u0430\\u043d.", "timestamp": 173.0}, {"speaker": "client", "text": "\\u0423\\u0433\\u0443.", "timestamp": 177.0}, {"speaker": "manager", "text": "\\u0412\\u043e\\u0442.", "timestamp": 179.0}, {"speaker": "manager", "text": "\\u0410 \\u0432\\u044b \\u0443\\u0436\\u0435 \\u043f\\u043e\\u043b\\u044c\\u0437\\u0443\\u0435\\u0442\\u0435\\u0441\\u044c \\u0442\\u0430\\u043a\\u043e\\u0439 \\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u043e\\u0439?", "timestamp": 181.0}, {"speaker": "client", "text": "\\u041d\\u0435\\u0442.", "timestamp": 182.0}, {"speaker": "manager", "text": "\\u0421\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435.", "timestamp": 183.0}, {"speaker": "client", "text": "\\u041d\\u0435\\u0442, \\u0434\\u0430? \\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u0430...", "timestamp": 185.0}, {"speaker": "manager", "text": "\\u0423 \\u0432\\u0430\\u0441 \\u0447\\u0435\\u043c \\u043f\\u0440\\u0435\\u0434\\u043f\\u0440\\u0438\\u044f\\u0442\\u0438\\u044f \\u0437\\u0430\\u043d\\u0438\\u043c\\u0430\\u044e\\u0442\\u0441\\u044f?", "timestamp": 188.0}, {"speaker": "client", "text": "\\u0422\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442\\u043d\\u0430\\u044f \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f.", "timestamp": 191.0}, {"speaker": "manager", "text": "\\u0415\\u0449\\u0435 \\u0440\\u0430\\u0437, \\u0442\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442\\u043d\\u0430\\u044f?", "timestamp": 192.0}, {"speaker": "client", "text": "\\u0422\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442\\u043d\\u0430\\u044f, \\u0442\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442\\u043d\\u0430\\u044f.", "timestamp": 194.0}, {"speaker": "manager", "text": "\\u0422\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442. \\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u0432\\u044b \\u0445\\u043e\\u0442\\u0438\\u0442\\u0435 \\u043f\\u043e\\u0434\\u0432\\u043e\\u0437\\u0438\\u0442\\u044c \\u0434\\u043b\\u044f \\u0441\\u0432\\u043e\\u0435\\u0439 \\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u0438, \\u043f\\u0440\\u0430\\u0432\\u0438\\u043b\\u044c\\u043d\\u043e \\u044f \\u043f\\u043e\\u043d\\u0438\\u043c\\u0430\\u044e?", "timestamp": 197.0}, {"speaker": "client", "text": "\\u0414\\u043b\\u044f \\u0441\\u0432\\u043e\\u0435\\u0439, \\u043a\\u043e\\u043d\\u0435\\u0447\\u043d\\u043e.", "timestamp": 200.0}, {"speaker": "manager", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e.", "timestamp": 201.0}, {"speaker": "manager", "text": "\\u0420\\u0430\\u043c\\u0438\\u043d, \\u0430 \\u0432\\u044b \\u0438\\u0437 \\u043a\\u0430\\u043a\\u043e\\u0433\\u043e \\u0433\\u043e\\u0440\\u043e\\u0434\\u0430 \\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u0435?", "timestamp": 204.0}, {"speaker": "client", "text": "\\u042f\\u043d\\u0430\\u043b.", "timestamp": 207.0}, {"speaker": "client", "text": "\\u042f\\u043c\\u0430\\u043b-\\u041d\\u0435\\u0432\\u0441\\u043a\\u0438\\u0439 \\u0430\\u0432\\u0442\\u043e\\u043d\\u043e\\u043c\\u043d\\u044b\\u0439 \\u043e\\u043a\\u0440\\u0443\\u0433.", "timestamp": 208.0}, {"speaker": "manager", "text": "\\u0423\\u0433\\u0443.", "timestamp": 211.0}, {"speaker": "manager", "text": "\\u0421\\u043c\\u043e\\u0442\\u0440\\u0438\\u0442\\u0435, \\u044f \\u043f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u043b\\u044e \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435.", "timestamp": 212.0}, {"speaker": "manager", "text": "\\u0412\\u043e\\u0442 \\u0441 \\u0442\\u0435\\u043b\\u0435\\u0444\\u043e\\u043d\\u0430, \\u043a\\u043e\\u0442\\u043e\\u0440\\u044b\\u0439 \\u0432\\u044b \\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u0435, \\u0442\\u0430\\u043c \\u041c\\u0430\\u043a\\u0441 \\u043f\\u0440\\u0438\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u0443\\u0435\\u0442 \\u0443 \\u0432\\u0430\\u0441?", "timestamp": 214.0}, {"speaker": "client", "text": "\\u041f\\u0440\\u0438\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u0443\\u0435\\u0442.", "timestamp": 217.0}, {"speaker": "manager", "text": "\\u042f \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0442\\u0443\\u0434\\u0430 \\u0432\\u0438\\u0437\\u0438\\u0442\\u043a\\u0443 \\u0443\\u0436\\u0435, \\u043d\\u0430\\u0432\\u0435\\u0440\\u043d\\u043e\\u0435, \\u0443\\u0448\\u043b\\u0430 \\u0443 \\u0432\\u0430\\u0441 \\u0432\\u0438\\u0437\\u0438\\u0442\\u043a\\u0430.", "timestamp": 219.0}, {"speaker": "manager", "text": "\\u041d\\u0443, \\u043c\\u043e\\u044f \\u0432\\u0438\\u0437\\u0438\\u0442\\u043a\\u0430.", "timestamp": 222.0}, {"speaker": "manager", "text": "\\u041f\\u0440\\u043e\\u0441\\u044c\\u0431\\u0430 \\u043f\\u0440\\u0438\\u0441\\u043b\\u0430\\u0442\\u044c \\u0430\\u0434\\u0440\\u0435\\u0441 \\u044d\\u043b\\u0435\\u043a\\u0442\\u0440\\u043e\\u043d\\u043d\\u043e\\u0439 \\u043f\\u043e\\u0447\\u0442\\u044b.", "timestamp": 224.0}, {"speaker": "client", "text": "\\u0421\\u0435\\u0439\\u0447\\u0430\\u0441 \\u044f \\u043f\\u0440\\u043e\\u0432\\u0435\\u0440\\u044e, \\u043c\\u043e\\u0436\\u0435\\u0442 \\u0431\\u044b\\u0442\\u044c \\u0443 \\u043c\\u0435\\u043d\\u044f \\u043e\\u0442\\u0440\\u0430\\u0437\\u0438\\u043b\\u0441\\u044f.", "timestamp": 227.0}, {"speaker": "client", "text": "\\u041d\\u0435\\u0442, \\u0443 \\u043c\\u0435\\u043d\\u044f \\u043d\\u0435\\u0442\\u0443 \\u0430\\u0434\\u0440\\u0435\\u0441 \\u044d\\u043b\\u0435\\u043a\\u0442\\u0440\\u043e\\u043d\\u043d\\u043e\\u0439 \\u043f\\u043e\\u0447\\u0442\\u044b.", "timestamp": 229.0}, {"speaker": "manager", "text": "\\u042f \\u0442\\u0443\\u0434\\u0430 \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u044e \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435.", "timestamp": 231.0}, {"speaker": "manager", "text": "\\u0421\\u043e \\u0432\\u0441\\u0435\\u043c\\u0438 \\u0445\\u0430\\u0440\\u0430\\u043a\\u0442\\u0435\\u0440\\u0438\\u0441\\u0442\\u0438\\u043a\\u0430\\u043c\\u0438 \\u043f\\u043e\\u0434\\u0440\\u043e\\u0431\\u043d\\u044b\\u043c\\u0438.", "timestamp": 234.0}, {"speaker": "manager", "text": "\\u0418 \\u0441\\u0442\\u043e\\u0438\\u043c\\u043e\\u0441\\u0442\\u044c\\u044e.", "timestamp": 237.0}, {"speaker": "manager", "text": "\\u0412\\u044b \\u043f\\u043e\\u0434\\u0441\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435, \\u0432\\u0430\\u043c \\u0434\\u043e\\u0441\\u0442\\u0430\\u0432\\u043a\\u0430 \\u043d\\u0443\\u0436\\u043d\\u0430 \\u0431\\u0443\\u0434\\u0435\\u0442?", "timestamp": 239.0}, {"speaker": "client", "text": "\\u0418\\u043b\\u0438 \\u0432\\u044b \\u0433\\u043e\\u0442\\u043e\\u0432\\u044b \\u0438\\u0437 \\u041d\\u0438\\u0436\\u043d\\u0435\\u0433\\u043e \\u0413\\u043e\\u0440\\u043e\\u0434\\u0430?", "timestamp": 241.0}, {"speaker": "client", "text": "\\u041d\\u0443, \\u043d\\u0430\\u0434\\u043e \\u043f\\u043e\\u0441\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u0435\\u0449\\u0435.", "timestamp": 243.0}, {"speaker": "client", "text": "\\u041a\\u043e\\u0433\\u0434\\u0430, \\u0447\\u0442\\u043e.", "timestamp": 245.0}, {"speaker": "client", "text": "\\u0415\\u0449\\u0435 \\u043f\\u043e\\u043d\\u044f\\u0442\\u044c \\u0431\\u044b.", "timestamp": 247.0}, {"speaker": "client", "text": "\\u041d\\u0443, \\u0442\\u043e \\u0435\\u0441\\u0442\\u044c, \\u043f\\u043e\\u043a\\u0430 \\u044f \\u0431\\u0435\\u0437 \\u0434\\u043e\\u0441\\u0442\\u0430\\u0432\\u043a\\u0438 \\u0441\\u0447\\u0438\\u0442\\u0430\\u044e.", "timestamp": 249.0}, {"speaker": "manager", "text": "\\u0414\\u0430, \\u0434\\u0430, \\u0434\\u0430.", "timestamp": 252.0}, {"speaker": "manager", "text": "\\u0411\\u0435\\u0437 \\u0434\\u043e\\u0441\\u0442\\u0430\\u0432\\u043a\\u0438.", "timestamp": 254.0}, {"speaker": "manager", "text": "\\u0410 \\u0432\\u043e\\u0442 \\u0442\\u0430\\u043a\\u043e\\u0439 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441, \\u043a\\u0430\\u043a \\u043e\\u0440\\u0433\\u0430\\u043d\\u0438\\u0437\\u0430\\u0446\\u0438\\u044f \\u0443 \\u0432\\u0430\\u0441 \\u043d\\u0430\\u0437\\u044b\\u0432\\u0430\\u0435\\u0442\\u0441\\u044f?", "timestamp": 256.0}, {"speaker": "client", "text": "\\u041f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u043e\\u0447\\u043d\\u0430\\u044f.", "timestamp": 259.0}, {"speaker": "client", "text": "\\u041d\\u0443, \\u0434\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435 \\u0438 \\u043f\\u0440\\u043e\\u0438\\u0437\\u0432\\u043e\\u0434\\u0438\\u043c.", "timestamp": 260.0}, {"speaker": "manager", "text": "\\u0418\\u043c\\u0435\\u043d\\u0435\\u043d \\u043c\\u043e\\u0433\\u0443 \\u0441\\u043a\\u0438\\u043d\\u0443\\u0442\\u044c, \\u0435\\u0441\\u043b\\u0438 \\u0447\\u0442\\u043e.", "timestamp": 262.0}, {"speaker": "client", "text": "\\u0414\\u0430, \\u043a\\u043e\\u043d\\u0435\\u0447\\u043d\\u043e.", "timestamp": 264.0}, {"speaker": "manager", "text": "\\u041a\\u0430\\u0440\\u0442\\u043e\\u0447\\u043a\\u0443 \\u043f\\u0440\\u0435\\u0434\\u043f\\u0440\\u0438\\u044f\\u0442\\u0438\\u044f \\u043c\\u043e\\u0433\\u0443 \\u0441\\u043a\\u0438\\u043d\\u0443\\u0442\\u044c.", "timestamp": 268.0}, {"speaker": "manager", "text": "\\u0414\\u0430, \\u0442\\u043e\\u0433\\u0434\\u0430 \\u044f \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043d\\u0430\\u043f\\u0438\\u0448\\u0443 \\u0432 \\u041c\\u0430\\u043a\\u0441\\u0435.", "timestamp": 270.0}, {"speaker": "manager", "text": "\\u0412\\u044b \\u0441\\u043a\\u0438\\u043d\\u044c\\u0442\\u0435, \\u043f\\u043e\\u0436\\u0430\\u043b\\u0443\\u0439\\u0441\\u0442\\u0430, \\u043c\\u043d\\u0435 \\u043f\\u043e\\u0447\\u0442\\u0443 \\u0438 \\u043a\\u0430\\u0440\\u0442\\u043e\\u0447\\u043a\\u0443 \\u043f\\u0440\\u0435\\u0434\\u043f\\u0440\\u0438\\u044f\\u0442\\u0438\\u044f.", "timestamp": 273.0}, {"speaker": "manager", "text": "\\u042f \\u0432\\u0430\\u043c \\u043f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u043b\\u044e \\u0438\\u043b\\u0438 \\u0438\\u043d\\u043e\\u0435 \\u043a\\u043e\\u043c\\u043c\\u0435\\u0440\\u0447\\u0435\\u0441\\u043a\\u043e\\u0435 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435.", "timestamp": 276.0}, {"speaker": "client", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e.", "timestamp": 277.0}, {"speaker": "manager", "text": "\\u0423 \\u0432\\u0430\\u0441 \\u043f\\u043e \\u0432\\u0440\\u0435\\u043c\\u0435\\u043d\\u0438 \\u043e\\u0442 \\u041c\\u043e\\u0441\\u043a\\u043e\\u0432\\u0441\\u043a\\u043e\\u0433\\u043e \\u043e\\u0442\\u043b\\u0438\\u0447\\u0430\\u0435\\u0442\\u0441\\u044f?", "timestamp": 280.0}, {"speaker": "client", "text": "\\u0414\\u0432\\u0430 \\u0447\\u0430\\u0441\\u0430.", "timestamp": 282.0}, {"speaker": "client", "text": "\\u0414\\u0432\\u0430 \\u0447\\u0430\\u0441\\u0430.", "timestamp": 283.0}, {"speaker": "client", "text": "\\u0412 \\u041c\\u043e\\u0441\\u043a\\u0432\\u0435 \\u0432\\u043e\\u0441\\u0435\\u043c\\u044c \\u0443\\u0442\\u0440\\u0430, \\u0430 \\u0443 \\u043d\\u0430\\u0441 \\u0434\\u0435\\u0441\\u044f\\u0442\\u044c.", "timestamp": 285.0}, {"speaker": "client", "text": "\\u0423\\u0433\\u0443.", "timestamp": 286.0}, {"speaker": "manager", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e.", "timestamp": 287.0}, {"speaker": "client", "text": "\\u041d\\u0443, \\u043c\\u044b \\u0442\\u043e\\u0436\\u0435 \\u0443\\u0436\\u0435 \\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u0435\\u043c.", "timestamp": 288.0}, {"speaker": "manager", "text": "\\u0421\\u043e\\u043e\\u0442\\u0432\\u0435\\u0442\\u0441\\u0442\\u0432\\u0435\\u043d\\u043d\\u043e, \\u043f\\u043b\\u044e\\u0441 \\u0434\\u0432\\u0430 \\u0447\\u0430\\u0441\\u0430 \\u044f \\u043f\\u043e \\u043c\\u0435\\u0441\\u0442\\u0443 \\u043f\\u0440\\u043e\\u0441\\u0442\\u043e \\u043f\\u043e\\u0441\\u0442\\u0430\\u0432\\u043b\\u044e,", "timestamp": 290.0}, {"speaker": "manager", "text": "\\u0447\\u0442\\u043e\\u0431\\u044b \\u0432\\u0430\\u043c \\u043f\\u043e\\u0437\\u0434\\u043d\\u043e \\u043d\\u0435 \\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u044c.", "timestamp": 293.0}, {"speaker": "manager", "text": "\\u041f\\u043e\\u0441\\u0442\\u0430\\u0440\\u0430\\u044e\\u0441\\u044c \\u0441\\u0435\\u0433\\u043e\\u0434\\u043d\\u044f, \\u0441\\u0435\\u0433\\u043e\\u0434\\u043d\\u044f \\u0434\\u043d\\u044f \\u0432\\u0430\\u043c \\u043f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u0438\\u0442\\u044c.", "timestamp": 296.0}, {"speaker": "manager", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u0435\\u0449\\u0435 \\u0440\\u0430\\u0437 \\u043f\\u043e\\u0433\\u043e\\u0432\\u043e\\u0440\\u0438\\u043c \\u043d\\u0430 \\u0423\\u0410\\u0417\\u0435 \\u043f\\u043e\\u043b\\u043d\\u043e\\u043f\\u0440\\u0438\\u0432\\u043e\\u0434\\u043d\\u043e\\u043c \\u043f\\u0440\\u043e\\u0444\\u0435.", "timestamp": 299.0}, {"speaker": "manager", "text": "\\u0422\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a.", "timestamp": 301.0}, {"speaker": "manager", "text": "\\u0414\\u0432\\u0435 \\u0445\\u0435\\u043a\\u0441\\u044b, \\u0447\\u0442\\u043e\\u0431\\u044b \\u043c\\u043e\\u0436\\u043d\\u043e \\u0431\\u044b\\u043b\\u043e \\u043f\\u0435\\u0440\\u0435\\u0432\\u043e\\u0437\\u0438\\u0442\\u044c,", "timestamp": 303.0}, {"speaker": "manager", "text": "\\u043f\\u0435\\u0440\\u0435\\u0432\\u043e\\u0437\\u0438\\u0442\\u044c \\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e.", "timestamp": 304.0}, {"speaker": "client", "text": "\\u0418 \\u0434\\u0432\\u0435 \\u0440\\u0430\\u0437\\u0434\\u0430\\u0447\\u043d\\u044b\\u0435 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0438, \\u043f\\u0440\\u0430\\u0432\\u0438\\u043b\\u044c\\u043d\\u043e?", "timestamp": 305.0}, {"speaker": "client", "text": "\\u0414\\u0430.", "timestamp": 308.0}, {"speaker": "manager", "text": "\\u0412\\u0441\\u0435, \\u0442\\u043e\\u0433\\u0434\\u0430 \\u0443 \\u0432\\u0430\\u0441...", "timestamp": 310.0}, {"speaker": "manager", "text": "\\u0410 \\u0443 \\u043d\\u0430\\u0441 \\u0435\\u0441\\u0442\\u044c \\u043a\\u0430\\u043a\\u0438\\u0435-\\u0442\\u043e \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b \\u0435\\u0449\\u0435?", "timestamp": 312.0}, {"speaker": "client", "text": "\\u041d\\u0435\\u0442.", "timestamp": 314.0}, {"speaker": "manager", "text": "\\u0412\\u0441\\u0435, \\u0442\\u043e\\u0433\\u0434\\u0430...", "timestamp": 316.0}, {"speaker": "manager", "text": "\\u0422\\u0430\\u043a, \\u043a\\u043e\\u043c\\u043c\\u0435\\u0440\\u0447\\u0435\\u0441\\u043a\\u043e\\u0435 \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u044e, \\u0442\\u043e\\u0436\\u0435 \\u043f\\u043e\\u0437\\u0432\\u043e\\u043d\\u044e,", "timestamp": 319.0}, {"speaker": "manager", "text": "\\u0443\\u0432\\u0438\\u0436\\u0443, \\u0447\\u0442\\u043e \\u044d\\u0442\\u043e \\u043f\\u0440\\u0438\\u0448\\u043b\\u043e.", "timestamp": 320.0}, {"speaker": "client", "text": "\\u0412\\u0441\\u0435 \\u0445\\u043e\\u0440\\u043e\\u0448\\u043e.", "timestamp": 321.0}, {"speaker": "manager", "text": "\\u0414\\u043e \\u0441\\u0432\\u0438\\u0434\\u0430\\u043d\\u0438\\u044f.", "timestamp": 322.0}, {"speaker": "client", "text": "\\u0412\\u0441\\u0435, \\u0434\\u043e\\u0431\\u0440\\u043e.", "timestamp": 323.0}, {"speaker": "client", "text": "\\u0414\\u043e \\u0441\\u0432\\u0438\\u0434\\u0430\\u043d\\u0438\\u044f.", "timestamp": 324.0}], "client_data": {"request": "\\u0422\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a.", "income_source": "\\u0422\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442\\u043d\\u0430\\u044f \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f.", "age": null, "city": "\\u042f\\u043c\\u0430\\u043b-\\u041d\\u0435\\u0432\\u0441\\u043a\\u0438\\u0439 \\u0430\\u0432\\u0442\\u043e\\u043d\\u043e\\u043c\\u043d\\u044b\\u0439 \\u043e\\u043a\\u0440\\u0443\\u0433", "purchase_readiness": "\\u0432\\u044b\\u0441\\u043e\\u043a\\u0430\\u044f", "main_objections": [], "result_timeline": "\\u0432 \\u0442\\u0435\\u0447\\u0435\\u043d\\u0438\\u0435 40 \\u0440\\u0430\\u0431\\u043e\\u0447\\u0438\\u0445 \\u0434\\u043d\\u0435\\u0439"}}	PARTIAL	75	65.7	{"manager_speech_ratio": 60}	["\\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u0430", "\\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a", "\\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435"]	{"count": 1, "types": ["\\u0434\\u043e\\u0441\\u0442\\u0430\\u0432\\u043a\\u0430"], "handled": true}	upload	\N	2026-07-01 20:16:29.784274+00	2026-07-08 11:52:57.0246+00	2026-07-05 19:15:45.910382+00	20	new_lead	f
\.


--
-- Data for Name: criteria; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.criteria (id, key, label, description, what_to_check, bad_example, partial_example, good_example, max_score, sort_order, is_active, created_at, updated_at) FROM stdin;
2	speech	Речь	Чёткая, структурированная речь без слов-паразитов	\N	много мусора, клиент переспрашивает	редкие паразиты (ну, типа, как бы)	чёткая, без паразитов, понятная	1	2	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
3	initiative	Инициатива	Менеджер управляет диалогом, задаёт больше вопросов	\N	пассивная позиция, клиент рулит	иногда теряет, но перехватывает	управляет диалогом, перехватывает инициативу	2	3	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
4	programming	Программирование	Использование связки: перехват → цель → вопрос	\N	не использует	без вопроса в конце	перехват+цель+вопрос в конце	2	4	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
5	qualification	Квалификация	Выявление потребностей клиента	\N	пропущена квалификация	недостаточно вопросов	достаточно вопросов для выявления потребности	2	5	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
6	pain	Боль	Вопросы на проблему/боль клиента	\N	вопросы на боль не заданы	клиент сам обозначил боль	задал вопросы на боль, выяснил что важно	3	6	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
7	product	Продукт	Презентация продукта с выгодами	\N	презентация отсутствует	формально без привязки к боли	подробно с выгодами под потребности	3	7	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
8	expertise	Экспертность	Знание продукта, кейсы, уверенные ответы	\N	не смог ответить клиенту	не на все вопросы может ответить	кейсы, опыт, уверенные ответы	2	8	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
9	closing	Закрытие	Закрытие на сделку или следующий шаг	\N	не закрыл, просто попрощался	подготовил КП, назначил встречу	закрыл на сделку (договор/оплата)	2	9	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
10	push	Дожим	Отработка возражений клиента	\N	согласился с возражением, пропустил	попытался, но не дожал	аргументированно отработал возражение	3	10	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
11	next_step	Следующий шаг	Чёткое назначение следующего касания	\N	отсутствует, отпустил клиента	без чёткого времени (позвоню на неделе)	с точной датой и временем	2	11	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
12	framing	Фрейминг	Подстройка под клиента, общий язык	\N	спорит, перебивает	незначительные недопонимания	полностью подстроился	1	12	t	2026-06-26 10:58:39.395153+00	2026-06-26 10:58:39.395153+00
1	greeting	Приветствие	Полное приветствие, назвать имя, компанию, цель звонка	\N	пропустил приветствие	неполное (не назвал имя/компанию/цель)	обратился по имени, пауза, представился, цель, компания	1	1	t	2026-06-26 10:58:39.395153+00	2026-06-26 11:07:45.643823+00
\.


--
-- Data for Name: knowledge_base; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.knowledge_base (id, title, content, category, sort_order, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sales_calls; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.sales_calls (id, campaign_id, contact_id, phone, duration_seconds, status, result, result_reason, script_stage, conversation, summary, quality_score, quality_details, client_data, simulation_config, created_at, updated_at, started_at, completed_at) FROM stdin;
1	1	1	+375291234567	\N	FAILED	CALLBACK	Ошибка симуляции: 'reason'	\N	[{"speaker": "salesman", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c, \\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432. \\u041c\\u0435\\u043d\\u044f \\u0437\\u043e\\u0432\\u0443\\u0442 \\u0412\\u0438\\u0442\\u0430\\u043b\\u0438\\u0439, \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f \\u0414\\u0438\\u043a\\u0438\\u0435 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436\\u0438. \\u041c\\u044b \\u043f\\u043e\\u043c\\u043e\\u0433\\u0430\\u0435\\u043c \\u0441\\u0442\\u0440\\u043e\\u0438\\u0442\\u044c \\u0441\\u0438\\u0441\\u0442\\u0435\\u043c\\u043d\\u043e \\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u044e\\u0449\\u0438\\u0435 \\u043e\\u0442\\u0434\\u0435\\u043b\\u044b \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436. \\u0417\\u0432\\u043e\\u043d\\u044e, \\u043f\\u043e\\u0442\\u043e\\u043c\\u0443 \\u0447\\u0442\\u043e \\u0412\\u044b \\u043e\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0438 \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443 \\u043d\\u0430 \\u044d\\u043a\\u0441\\u043f\\u0440\\u0435\\u0441\\u0441 \\u0430\\u0443\\u0434\\u0438\\u0442 \\u0412\\u0430\\u0448\\u0435\\u0433\\u043e \\u043e\\u0442\\u0434\\u0435\\u043b\\u0430 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436. \\u0412\\u0430\\u043c \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0443\\u0434\\u043e\\u0431\\u043d\\u043e \\u043f\\u043e\\u043e\\u0431\\u0449\\u0430\\u0442\\u044c\\u0441\\u044f 3 \\u043c\\u0438\\u043d\\u0443\\u0442\\u044b?", "turn": 0}, {"speaker": "client", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c, \\u0412\\u0438\\u0442\\u0430\\u043b\\u0438\\u0439. \\u0414\\u0430, \\u044f \\u043e\\u0441\\u0442\\u0430\\u0432\\u043b\\u044f\\u043b \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443, \\u043d\\u043e \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0443 \\u043c\\u0435\\u043d\\u044f \\u043d\\u0435\\u0442 \\u0432\\u0440\\u0435\\u043c\\u0435\\u043d\\u0438. \\u041c\\u043e\\u0436\\u0435\\u0442\\u0435 \\u043f\\u0435\\u0440\\u0435\\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u044c \\u043f\\u043e\\u0437\\u0436\\u0435?", "turn": 1}, {"speaker": "salesman", "text": "\\u041a\\u043e\\u043d\\u0435\\u0447\\u043d\\u043e, \\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432, \\u043a\\u043e\\u0433\\u0434\\u0430 \\u0431\\u0443\\u0434\\u0435\\u0442 \\u0443\\u0434\\u043e\\u0431\\u043d\\u043e \\u043f\\u0435\\u0440\\u0435\\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u044c?", "turn": 2}, {"speaker": "client", "text": "\\u0414\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435 \\u043d\\u0430 \\u0441\\u043b\\u0435\\u0434\\u0443\\u044e\\u0449\\u0435\\u0439 \\u043d\\u0435\\u0434\\u0435\\u043b\\u0435, \\u0432 \\u043f\\u043e\\u043d\\u0435\\u0434\\u0435\\u043b\\u044c\\u043d\\u0438\\u043a.", "turn": 3}, {"speaker": "salesman", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e, \\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432, \\u0432 \\u043f\\u043e\\u043d\\u0435\\u0434\\u0435\\u043b\\u044c\\u043d\\u0438\\u043a \\u043f\\u0435\\u0440\\u0435\\u0437\\u0432\\u043e\\u043d\\u044e. \\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e!", "turn": 4}, {"speaker": "client", "text": "\\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e, \\u0434\\u043e \\u0441\\u0432\\u0438\\u0434\\u0430\\u043d\\u0438\\u044f!", "turn": 5}]	Продавец Виталий позвонил Ивану Петрову, чтобы обсудить заявку на экспресс аудит отдела продаж. Клиент сообщил, что у него нет времени и попросил перезвонить позже, на что продавец согласился и назначил звонок на понедельник следующей недели. В ходе разговора продавец проявил вежливость и профессионализм.	80	{"script_adherence": 85, "objection_handling": 75, "politeness": 90, "goal_achievement": 70, "engagement": 65}	\N	{"name": "\\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432", "personality": "\\u043d\\u0435\\u0439\\u0442\\u0440\\u0430\\u043b\\u044c\\u043d\\u044b\\u0439, \\u043d\\u043e \\u0437\\u0430\\u043d\\u044f\\u0442\\u043e\\u0439 \\u043f\\u0440\\u0435\\u0434\\u043f\\u0440\\u0438\\u043d\\u0438\\u043c\\u0430\\u0442\\u0435\\u043b\\u044c, \\u0432\\u043b\\u0430\\u0434\\u0435\\u043b\\u0435\\u0446 \\u043d\\u0435\\u0431\\u043e\\u043b\\u044c\\u0448\\u043e\\u0439 IT-\\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u0438", "objections": ["\\u0423 \\u043d\\u0430\\u0441 \\u0443\\u0436\\u0435 \\u0435\\u0441\\u0442\\u044c \\u043e\\u0442\\u0434\\u0435\\u043b \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436", "\\u0421\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043d\\u0435\\u0442 \\u0432\\u0440\\u0435\\u043c\\u0435\\u043d\\u0438", "\\u0421\\u043a\\u043e\\u043b\\u044c\\u043a\\u043e \\u0441\\u0442\\u043e\\u0438\\u0442?"], "max_turns": 20}	2026-07-13 11:21:20.665931+00	2026-07-13 11:21:20.681359+00	2026-07-13 11:21:20.670856+00	\N
2	1	1	+375291234567	\N	FAILED	INTERESTED	Ошибка симуляции: 'reason'	\N	[{"speaker": "salesman", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c, \\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432. \\u041c\\u0435\\u043d\\u044f \\u0437\\u043e\\u0432\\u0443\\u0442 \\u0412\\u0438\\u0442\\u0430\\u043b\\u0438\\u0439, \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f \\u0414\\u0438\\u043a\\u0438\\u0435 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436\\u0438. \\u041c\\u044b \\u043f\\u043e\\u043c\\u043e\\u0433\\u0430\\u0435\\u043c \\u0441\\u0442\\u0440\\u043e\\u0438\\u0442\\u044c \\u0441\\u0438\\u0441\\u0442\\u0435\\u043c\\u043d\\u043e \\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u044e\\u0449\\u0438\\u0435 \\u043e\\u0442\\u0434\\u0435\\u043b\\u044b \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436. \\u0417\\u0432\\u043e\\u043d\\u044e, \\u043f\\u043e\\u0442\\u043e\\u043c\\u0443 \\u0447\\u0442\\u043e \\u0412\\u044b \\u043e\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0438 \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443 \\u043d\\u0430 \\u044d\\u043a\\u0441\\u043f\\u0440\\u0435\\u0441\\u0441 \\u0430\\u0443\\u0434\\u0438\\u0442 \\u0412\\u0430\\u0448\\u0435\\u0433\\u043e \\u043e\\u0442\\u0434\\u0435\\u043b\\u0430 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436. \\u0412\\u0430\\u043c \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0443\\u0434\\u043e\\u0431\\u043d\\u043e \\u043f\\u043e\\u043e\\u0431\\u0449\\u0430\\u0442\\u044c\\u0441\\u044f 3 \\u043c\\u0438\\u043d\\u0443\\u0442\\u044b?", "turn": 0}, {"speaker": "client", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c, \\u0412\\u0438\\u0442\\u0430\\u043b\\u0438\\u0439. \\u0414\\u0430, \\u0432\\u0440\\u0435\\u043c\\u0435\\u043d\\u0438 \\u043d\\u0435\\u043c\\u043d\\u043e\\u0433\\u043e, \\u043d\\u043e \\u0441\\u043b\\u0443\\u0448\\u0430\\u044e \\u0432\\u0430\\u0441.", "turn": 1}, {"speaker": "salesman", "text": "\\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432, \\u0434\\u043b\\u044f \\u0442\\u043e\\u0433\\u043e \\u0447\\u0442\\u043e\\u0431\\u044b \\u043f\\u043e\\u043d\\u044f\\u0442\\u044c \\u043c\\u043e\\u0436\\u0435\\u043c \\u043b\\u0438 \\u043c\\u044b \\u0431\\u044b\\u0442\\u044c \\u0412\\u0430\\u043c \\u0447\\u0435\\u043c-\\u043d\\u0438\\u0431\\u0443\\u0434\\u044c \\u043f\\u043e\\u043b\\u0435\\u0437\\u043d\\u044b, \\u044f \\u0437\\u0430\\u0434\\u0430\\u043c \\u0412\\u0430\\u043c \\u043d\\u0435\\u0441\\u043a\\u043e\\u043b\\u044c\\u043a\\u043e \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432. \\u0415\\u0441\\u043b\\u0438 \\u043c\\u044b \\u0443\\u0432\\u0438\\u0434\\u0438\\u043c, \\u0447\\u0442\\u043e \\u0434\\u043b\\u044f \\u0412\\u0430\\u0441 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441 \\u043e\\u0442\\u0434\\u0435\\u043b\\u0430 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436 \\u0430\\u043a\\u0442\\u0443\\u0430\\u043b\\u0435\\u043d, \\u0442\\u043e \\u043d\\u0430\\u0437\\u043d\\u0430\\u0447\\u0438\\u043c \\u0441 \\u0412\\u0430\\u043c\\u0438 \\u0417\\u0423\\u041c \\u0432\\u0441\\u0442\\u0440\\u0435\\u0447\\u0443, \\u0447\\u0442\\u043e\\u0431\\u044b \\u0443\\u0436\\u0435 \\u043f\\u043e\\u0434\\u0440\\u043e\\u0431\\u043d\\u0435\\u0435 \\u0440\\u0430\\u0437\\u043e\\u0431\\u0440\\u0430\\u0442\\u044c \\u0441\\u0438\\u0442\\u0443\\u0430\\u0446\\u0438\\u044e, \\u0445\\u043e\\u0440\\u043e\\u0448\\u043e?", "turn": 2}, {"speaker": "client", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e, \\u0437\\u0430\\u0434\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b.", "turn": 3}, {"speaker": "salesman", "text": "\\u041a\\u0430\\u043a \\u043d\\u0430\\u0437\\u044b\\u0432\\u0430\\u0435\\u0442\\u0441\\u044f \\u0412\\u0430\\u0448\\u0430 \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f \\u0438 \\u0447\\u0435\\u043c \\u0437\\u0430\\u043d\\u0438\\u043c\\u0430\\u0435\\u0442\\u0441\\u044f?", "turn": 4}, {"speaker": "client", "text": "\\u041d\\u0430\\u0448\\u0430 \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f \\u043d\\u0430\\u0437\\u044b\\u0432\\u0430\\u0435\\u0442\\u0441\\u044f \\"\\u0422\\u0435\\u0445\\u043d\\u043e\\u0421\\u0435\\u0440\\u0432\\u0438\\u0441\\", \\u043c\\u044b \\u0437\\u0430\\u043d\\u0438\\u043c\\u0430\\u0435\\u043c\\u0441\\u044f \\u043f\\u043e\\u0441\\u0442\\u0430\\u0432\\u043a\\u0430\\u043c\\u0438 \\u043e\\u0431\\u043e\\u0440\\u0443\\u0434\\u043e\\u0432\\u0430\\u043d\\u0438\\u044f.", "turn": 5}, {"speaker": "salesman", "text": "\\u041a\\u0430\\u043a\\u0430\\u044f \\u0412\\u0430\\u0448\\u0430 \\u0440\\u043e\\u043b\\u044c \\u0432 \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u0438? \\u0415\\u0441\\u0442\\u044c \\u043b\\u0438 \\u043e\\u0442\\u0434\\u0435\\u043b \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436 \\u0438 \\u043a\\u0430\\u043a\\u043e\\u0439 \\u0435\\u0433\\u043e \\u0441\\u043e\\u0441\\u0442\\u0430\\u0432?", "turn": 6}, {"speaker": "client", "text": "\\u042f \\u0437\\u0430\\u043d\\u0438\\u043c\\u0430\\u044e \\u043f\\u043e\\u0437\\u0438\\u0446\\u0438\\u044e \\u043c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440\\u0430, \\u0443 \\u043d\\u0430\\u0441 \\u0435\\u0441\\u0442\\u044c \\u043e\\u0442\\u0434\\u0435\\u043b \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436 \\u0438\\u0437 \\u043f\\u044f\\u0442\\u0438 \\u0447\\u0435\\u043b\\u043e\\u0432\\u0435\\u043a.", "turn": 7}, {"speaker": "salesman", "text": "\\u041a\\u0430\\u043a\\u043e\\u0439 \\u043e\\u0442\\u0432\\u0435\\u0442 \\u043d\\u0430 \\u043a\\u0430\\u043a\\u043e\\u0439 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441 \\u0438\\u0449\\u0435\\u0442\\u0435?", "turn": 8}, {"speaker": "client", "text": "\\u041c\\u044b \\u0438\\u0449\\u0435\\u043c \\u0441\\u043f\\u043e\\u0441\\u043e\\u0431\\u044b \\u0443\\u0432\\u0435\\u043b\\u0438\\u0447\\u0438\\u0442\\u044c \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436\\u0438 \\u0438 \\u0443\\u043b\\u0443\\u0447\\u0448\\u0438\\u0442\\u044c \\u044d\\u0444\\u0444\\u0435\\u043a\\u0442\\u0438\\u0432\\u043d\\u043e\\u0441\\u0442\\u044c \\u0440\\u0430\\u0431\\u043e\\u0442\\u044b \\u043a\\u043e\\u043c\\u0430\\u043d\\u0434\\u044b.", "turn": 9}]	Продавец Виталий позвонил Ивану Петрову из компании 'ТехноСервис' для обсуждения экспресс аудита отдела продаж. В ходе разговора выяснили, что Иван является менеджером в компании с отделом продаж из пяти человек, и они ищут способы увеличить продажи и улучшить эффективность работы команды. Продавец предложил задать вопросы для дальнейшего анализа ситуации.	85	{"script_adherence": 80, "objection_handling": 75, "politeness": 90, "goal_achievement": 80, "engagement": 85}	\N	{"name": "\\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432", "personality": "\\u043d\\u0435\\u0439\\u0442\\u0440\\u0430\\u043b\\u044c\\u043d\\u044b\\u0439, \\u0437\\u0430\\u043d\\u044f\\u0442\\u043e\\u0439", "objections": [], "max_turns": 5}	2026-07-13 11:21:46.282209+00	2026-07-13 11:21:46.288305+00	2026-07-13 11:21:46.28549+00	\N
3	1	1	+375291234567	\N	FAILED	NO_ANSWER	Ошибка симуляции: 'reason'	\N	[{"speaker": "salesman", "text": "\\u00ab\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c, \\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432. \\u041c\\u0435\\u043d\\u044f \\u0437\\u043e\\u0432\\u0443\\u0442 \\u0412\\u0438\\u0442\\u0430\\u043b\\u0438\\u0439, \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f \\u0414\\u0438\\u043a\\u0438\\u0435 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436\\u0438. \\u041c\\u044b \\u043f\\u043e\\u043c\\u043e\\u0433\\u0430\\u0435\\u043c \\u0441\\u0442\\u0440\\u043e\\u0438\\u0442\\u044c \\u0441\\u0438\\u0441\\u0442\\u0435\\u043c\\u043d\\u043e \\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u044e\\u0449\\u0438\\u0435 \\u043e\\u0442\\u0434\\u0435\\u043b\\u044b \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436. \\u0417\\u0432\\u043e\\u043d\\u044e, \\u043f\\u043e\\u0442\\u043e\\u043c\\u0443 \\u0447\\u0442\\u043e \\u0412\\u044b \\u043e\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0438 \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443 \\u043d\\u0430 \\u044d\\u043a\\u0441\\u043f\\u0440\\u0435\\u0441\\u0441 \\u0430\\u0443\\u0434\\u0438\\u0442 \\u0412\\u0430\\u0448\\u0435\\u0433\\u043e \\u043e\\u0442\\u0434\\u0435\\u043b\\u0430 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436. \\u0412\\u0430\\u043c \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0443\\u0434\\u043e\\u0431\\u043d\\u043e \\u043f\\u043e\\u043e\\u0431\\u0449\\u0430\\u0442\\u044c\\u0441\\u044f 3 \\u043c\\u0438\\u043d\\u0443\\u0442\\u044b?\\u00bb", "turn": 0}, {"speaker": "client", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c. \\u0414\\u0430, \\u044f \\u043e\\u0441\\u0442\\u0430\\u0432\\u043b\\u044f\\u043b \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443, \\u043d\\u043e \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043d\\u0435\\u043c\\u043d\\u043e\\u0433\\u043e \\u0437\\u0430\\u043d\\u044f\\u0442. \\u041c\\u043e\\u0436\\u043d\\u043e \\u043f\\u043e\\u0437\\u0436\\u0435 \\u043f\\u0435\\u0440\\u0435\\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u044c?", "turn": 1}, {"speaker": "salesman", "text": "\\u00ab\\u041a\\u043e\\u043d\\u0435\\u0447\\u043d\\u043e, \\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432, \\u043a\\u043e\\u0433\\u0434\\u0430 \\u0431\\u0443\\u0434\\u0435\\u0442 \\u0443\\u0434\\u043e\\u0431\\u043d\\u043e \\u043f\\u0435\\u0440\\u0435\\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u044c?\\u00bb", "turn": 2}, {"speaker": "client", "text": "\\u0414\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435, \\u0441\\u043a\\u0430\\u0436\\u0435\\u043c, \\u0437\\u0430\\u0432\\u0442\\u0440\\u0430 \\u043f\\u043e\\u0441\\u043b\\u0435 \\u043e\\u0431\\u0435\\u0434\\u0430?", "turn": 3}, {"speaker": "salesman", "text": "\\u00ab\\u041e\\u0442\\u043b\\u0438\\u0447\\u043d\\u043e, \\u0437\\u0430\\u043f\\u0438\\u0441\\u0430\\u043b \\u2014 \\u0437\\u0430\\u0432\\u0442\\u0440\\u0430 \\u043f\\u043e\\u0441\\u043b\\u0435 \\u043e\\u0431\\u0435\\u0434\\u0430 \\u043f\\u0435\\u0440\\u0435\\u0437\\u0432\\u043e\\u043d\\u044e. \\u0425\\u043e\\u0440\\u043e\\u0448\\u0435\\u0433\\u043e \\u0434\\u043d\\u044f!\\u00bb", "turn": 4}, {"speaker": "client", "text": "\\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e, \\u0445\\u043e\\u0440\\u043e\\u0448\\u0435\\u0433\\u043e \\u0434\\u043d\\u044f!", "turn": 5}, {"speaker": "salesman", "text": "\\u00ab\\u0412\\u0430\\u043c \\u0441\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e! \\u0414\\u043e \\u0437\\u0430\\u0432\\u0442\\u0440\\u0430!\\u00bb", "turn": 6}, {"speaker": "client", "text": "\\u0414\\u043e \\u0437\\u0430\\u0432\\u0442\\u0440\\u0430!", "turn": 7}, {"speaker": "salesman", "text": "\\u00ab\\u0414\\u043e \\u0437\\u0430\\u0432\\u0442\\u0440\\u0430!\\u00bb", "turn": 8}, {"speaker": "client", "text": "\\u041f\\u043e\\u043a\\u0430!", "turn": 9}]	Продавец Виталий позвонил Ивану Петрову, чтобы обсудить заявку на экспресс аудит отдела продаж. Клиент был занят и попросил перезвонить позже, на что продавец согласился и назначил время на завтра после обеда. Разговор завершился вежливым прощанием.	85	{"script_adherence": 80, "objection_handling": 90, "politeness": 95, "goal_achievement": 85, "engagement": 75}	\N	{"name": "\\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432", "personality": "\\u043d\\u0435\\u0439\\u0442\\u0440\\u0430\\u043b\\u044c\\u043d\\u044b\\u0439, \\u0437\\u0430\\u043d\\u044f\\u0442\\u043e\\u0439", "objections": [], "max_turns": 5}	2026-07-13 11:23:13.33095+00	2026-07-13 11:23:13.355429+00	2026-07-13 11:23:13.342574+00	\N
4	1	1	+375291234567	\N	FAILED	MEETING_SET	Ошибка симуляции: 'reason'	\N	[{"speaker": "salesman", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c, \\u0422\\u0435\\u0441\\u0442. \\u041c\\u0435\\u043d\\u044f \\u0437\\u043e\\u0432\\u0443\\u0442 \\u0412\\u0438\\u0442\\u0430\\u043b\\u0438\\u0439, \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f \\u0414\\u0438\\u043a\\u0438\\u0435 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436\\u0438. \\u041c\\u044b \\u043f\\u043e\\u043c\\u043e\\u0433\\u0430\\u0435\\u043c \\u0441\\u0442\\u0440\\u043e\\u0438\\u0442\\u044c \\u0441\\u0438\\u0441\\u0442\\u0435\\u043c\\u043d\\u043e \\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u044e\\u0449\\u0438\\u0435 \\u043e\\u0442\\u0434\\u0435\\u043b\\u044b \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436. \\u0417\\u0432\\u043e\\u043d\\u044e, \\u043f\\u043e\\u0442\\u043e\\u043c\\u0443 \\u0447\\u0442\\u043e \\u0412\\u044b \\u043e\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0438 \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443 \\u043d\\u0430 \\u044d\\u043a\\u0441\\u043f\\u0440\\u0435\\u0441\\u0441 \\u0430\\u0443\\u0434\\u0438\\u0442 \\u0412\\u0430\\u0448\\u0435\\u0433\\u043e \\u043e\\u0442\\u0434\\u0435\\u043b\\u0430 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436. \\u0412\\u0430\\u043c \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0443\\u0434\\u043e\\u0431\\u043d\\u043e \\u043f\\u043e\\u043e\\u0431\\u0449\\u0430\\u0442\\u044c\\u0441\\u044f 3 \\u043c\\u0438\\u043d\\u0443\\u0442\\u044b?", "turn": 0}, {"speaker": "client", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c, \\u0412\\u0438\\u0442\\u0430\\u043b\\u0438\\u0439. \\u0414\\u0430, \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043c\\u043e\\u0433\\u0443 \\u043f\\u043e\\u0433\\u043e\\u0432\\u043e\\u0440\\u0438\\u0442\\u044c, \\u043d\\u043e \\u0443 \\u043c\\u0435\\u043d\\u044f \\u043d\\u0435 \\u0442\\u0430\\u043a \\u043c\\u043d\\u043e\\u0433\\u043e \\u0432\\u0440\\u0435\\u043c\\u0435\\u043d\\u0438. \\u041a\\u0430\\u043a\\u043e\\u0439 \\u0443 \\u0432\\u0430\\u0441 \\u043f\\u043b\\u0430\\u043d \\u043f\\u043e \\u0430\\u0443\\u0434\\u0438\\u0442\\u0443?", "turn": 1}, {"speaker": "salesman", "text": "\\u0422\\u0435\\u0441\\u0442, \\u0434\\u043b\\u044f \\u0442\\u043e\\u0433\\u043e \\u0447\\u0442\\u043e\\u0431\\u044b \\u043f\\u043e\\u043d\\u044f\\u0442\\u044c, \\u043c\\u043e\\u0436\\u0435\\u043c \\u043b\\u0438 \\u043c\\u044b \\u0431\\u044b\\u0442\\u044c \\u0412\\u0430\\u043c \\u0447\\u0435\\u043c-\\u043d\\u0438\\u0431\\u0443\\u0434\\u044c \\u043f\\u043e\\u043b\\u0435\\u0437\\u043d\\u044b, \\u044f \\u0437\\u0430\\u0434\\u0430\\u043c \\u0412\\u0430\\u043c \\u043d\\u0435\\u0441\\u043a\\u043e\\u043b\\u044c\\u043a\\u043e \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432. \\u0415\\u0441\\u043b\\u0438 \\u043c\\u044b \\u0443\\u0432\\u0438\\u0434\\u0438\\u043c, \\u0447\\u0442\\u043e \\u0434\\u043b\\u044f \\u0412\\u0430\\u0441 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441 \\u043e\\u0442\\u0434\\u0435\\u043b\\u0430 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436 \\u0430\\u043a\\u0442\\u0443\\u0430\\u043b\\u0435\\u043d, \\u0442\\u043e \\u043d\\u0430\\u0437\\u043d\\u0430\\u0447\\u0438\\u043c \\u0441 \\u0412\\u0430\\u043c\\u0438 \\u0417\\u0423\\u041c \\u0432\\u0441\\u0442\\u0440\\u0435\\u0447\\u0443, \\u0447\\u0442\\u043e\\u0431\\u044b \\u0443\\u0436\\u0435 \\u043f\\u043e\\u0434\\u0440\\u043e\\u0431\\u043d\\u0435\\u0435 \\u0440\\u0430\\u0437\\u043e\\u0431\\u0440\\u0430\\u0442\\u044c \\u0441\\u0438\\u0442\\u0443\\u0430\\u0446\\u0438\\u044e, \\u0445\\u043e\\u0440\\u043e\\u0448\\u043e?", "turn": 2}, {"speaker": "client", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e, \\u0437\\u0430\\u0434\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b. \\u041d\\u043e \\u0443\\u0447\\u0442\\u0438\\u0442\\u0435, \\u0447\\u0442\\u043e \\u0443 \\u043c\\u0435\\u043d\\u044f \\u043d\\u0435 \\u0442\\u0430\\u043a \\u043c\\u043d\\u043e\\u0433\\u043e \\u0432\\u0440\\u0435\\u043c\\u0435\\u043d\\u0438.", "turn": 3}, {"speaker": "salesman", "text": "\\u041e\\u0442\\u043b\\u0438\\u0447\\u043d\\u043e, \\u0422\\u0435\\u0441\\u0442! \\u041f\\u0435\\u0440\\u0432\\u044b\\u0439 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441: \\u043a\\u0430\\u043a \\u043d\\u0430\\u0437\\u044b\\u0432\\u0430\\u0435\\u0442\\u0441\\u044f \\u0412\\u0430\\u0448\\u0430 \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f \\u0438 \\u0447\\u0435\\u043c \\u043e\\u043d\\u0430 \\u0437\\u0430\\u043d\\u0438\\u043c\\u0430\\u0435\\u0442\\u0441\\u044f?", "turn": 4}, {"speaker": "client", "text": "\\u041c\\u043e\\u044f \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f \\u043d\\u0430\\u0437\\u044b\\u0432\\u0430\\u0435\\u0442\\u0441\\u044f \\u0422\\u0435\\u0441\\u0442\\u043e\\u0432\\u043e\\u0435 \\u041e\\u041e\\u041e, \\u043c\\u044b \\u0437\\u0430\\u043d\\u0438\\u043c\\u0430\\u0435\\u043c\\u0441\\u044f \\u0440\\u0430\\u0437\\u0440\\u0430\\u0431\\u043e\\u0442\\u043a\\u043e\\u0439 \\u043f\\u0440\\u043e\\u0433\\u0440\\u0430\\u043c\\u043c\\u043d\\u043e\\u0433\\u043e \\u043e\\u0431\\u0435\\u0441\\u043f\\u0435\\u0447\\u0435\\u043d\\u0438\\u044f.", "turn": 5}]	Продавец Виталий из компании Дикие продажи связался с клиентом Тестом для обсуждения экспресс аудита отдела продаж. Клиент выразил готовность ответить на вопросы, но отметил, что у него ограниченное время. В процессе разговора клиент сообщил название своей компании и сферу деятельности.	85	{"script_adherence": 80, "objection_handling": 70, "politeness": 90, "goal_achievement": 75, "engagement": 80}	\N	{"name": "\\u0422\\u0435\\u0441\\u0442", "personality": "\\u043d\\u0435\\u0439\\u0442\\u0440\\u0430\\u043b\\u044c\\u043d\\u044b\\u0439", "objections": [], "max_turns": 3}	2026-07-13 11:23:39.525666+00	2026-07-13 11:23:39.531197+00	2026-07-13 11:23:39.52861+00	\N
5	1	1	+375291234567	70	COMPLETED	NO_ANSWER	Разговор завершился без результата	contact	[{"speaker": "salesman", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c, \\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432. \\u041c\\u0435\\u043d\\u044f \\u0437\\u043e\\u0432\\u0443\\u0442 \\u0412\\u0438\\u0442\\u0430\\u043b\\u0438\\u0439, \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f \\u0414\\u0438\\u043a\\u0438\\u0435 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436\\u0438. \\u041c\\u044b \\u043f\\u043e\\u043c\\u043e\\u0433\\u0430\\u0435\\u043c \\u0441\\u0442\\u0440\\u043e\\u0438\\u0442\\u044c \\u0441\\u0438\\u0441\\u0442\\u0435\\u043c\\u043d\\u043e \\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u044e\\u0449\\u0438\\u0435 \\u043e\\u0442\\u0434\\u0435\\u043b\\u044b \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436. \\u0417\\u0432\\u043e\\u043d\\u044e, \\u043f\\u043e\\u0442\\u043e\\u043c\\u0443 \\u0447\\u0442\\u043e \\u0412\\u044b \\u043e\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0438 \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443 \\u043d\\u0430 \\u044d\\u043a\\u0441\\u043f\\u0440\\u0435\\u0441\\u0441 \\u0430\\u0443\\u0434\\u0438\\u0442 \\u0412\\u0430\\u0448\\u0435\\u0433\\u043e \\u043e\\u0442\\u0434\\u0435\\u043b\\u0430 \\u043f\\u0440\\u043e\\u0434\\u0430\\u0436. \\u0412\\u0430\\u043c \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0443\\u0434\\u043e\\u0431\\u043d\\u043e \\u043f\\u043e\\u043e\\u0431\\u0449\\u0430\\u0442\\u044c\\u0441\\u044f 3 \\u043c\\u0438\\u043d\\u0443\\u0442\\u044b?", "turn": 0}, {"speaker": "client", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c, \\u0412\\u0438\\u0442\\u0430\\u043b\\u0438\\u0439. \\u0414\\u0430, \\u044f \\u043e\\u0441\\u0442\\u0430\\u0432\\u043b\\u044f\\u043b \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443, \\u043d\\u043e \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043d\\u0435\\u043c\\u043d\\u043e\\u0433\\u043e \\u0437\\u0430\\u043d\\u044f\\u0442. \\u041c\\u043e\\u0436\\u0435\\u043c \\u043f\\u043e\\u0433\\u043e\\u0432\\u043e\\u0440\\u0438\\u0442\\u044c \\u043f\\u043e\\u0437\\u0436\\u0435?", "turn": 1}, {"speaker": "salesman", "text": "\\u041a\\u043e\\u043d\\u0435\\u0447\\u043d\\u043e, \\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432, \\u043a\\u043e\\u0433\\u0434\\u0430 \\u0432\\u0430\\u043c \\u0431\\u0443\\u0434\\u0435\\u0442 \\u0443\\u0434\\u043e\\u0431\\u043d\\u043e \\u043f\\u0435\\u0440\\u0435\\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u044c?", "turn": 2}, {"speaker": "client", "text": "\\u0414\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435 \\u0437\\u0430\\u0432\\u0442\\u0440\\u0430 \\u0432 \\u043f\\u0435\\u0440\\u0432\\u043e\\u0439 \\u043f\\u043e\\u043b\\u043e\\u0432\\u0438\\u043d\\u0435 \\u0434\\u043d\\u044f.", "turn": 3}, {"speaker": "salesman", "text": "\\u041e\\u0442\\u043b\\u0438\\u0447\\u043d\\u043e, \\u0437\\u0430\\u043f\\u0438\\u0448\\u0443 \\u043d\\u0430 \\u0437\\u0430\\u0432\\u0442\\u0440\\u0430 \\u0432 \\u043f\\u0435\\u0440\\u0432\\u043e\\u0439 \\u043f\\u043e\\u043b\\u043e\\u0432\\u0438\\u043d\\u0435 \\u0434\\u043d\\u044f. \\u0412\\u043e \\u0441\\u043a\\u043e\\u043b\\u044c\\u043a\\u043e \\u0438\\u043c\\u0435\\u043d\\u043d\\u043e \\u0432\\u0430\\u043c \\u0431\\u0443\\u0434\\u0435\\u0442 \\u0443\\u0434\\u043e\\u0431\\u043d\\u043e?", "turn": 4}, {"speaker": "client", "text": "\\u0412 10 \\u0447\\u0430\\u0441\\u043e\\u0432 \\u0431\\u0443\\u0434\\u0435\\u0442 \\u043d\\u043e\\u0440\\u043c\\u0430\\u043b\\u044c\\u043d\\u043e.", "turn": 5}, {"speaker": "salesman", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e, \\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432, \\u0437\\u0430\\u0432\\u0442\\u0440\\u0430 \\u0432 10 \\u0447\\u0430\\u0441\\u043e\\u0432. \\u0416\\u0434\\u0443 \\u043d\\u0430\\u0448\\u0435\\u0433\\u043e \\u0440\\u0430\\u0437\\u0433\\u043e\\u0432\\u043e\\u0440\\u0430!", "turn": 6}, {"speaker": "client", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e, \\u0441\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e. \\u0414\\u043e \\u0437\\u0430\\u0432\\u0442\\u0440\\u0430!", "turn": 7}, {"speaker": "salesman", "text": "\\u0414\\u043e \\u0437\\u0430\\u0432\\u0442\\u0440\\u0430, \\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432! \\u0425\\u043e\\u0440\\u043e\\u0448\\u0435\\u0433\\u043e \\u0434\\u043d\\u044f!", "turn": 8}, {"speaker": "client", "text": "\\u0421\\u043f\\u0430\\u0441\\u0438\\u0431\\u043e, \\u0438 \\u0432\\u0430\\u043c \\u0445\\u043e\\u0440\\u043e\\u0448\\u0435\\u0433\\u043e \\u0434\\u043d\\u044f!", "turn": 9}]	Продавец Виталий связался с клиентом Иваном Петровым для обсуждения заявки на экспресс аудит отдела продаж. Клиент был занят, но согласился на перезвон завтра в 10 часов. Разговор завершился позитивно с назначением встречи.	85	{"script_adherence": 90, "objection_handling": 80, "politeness": 95, "goal_achievement": 90, "engagement": 80}	{}	{"name": "\\u0418\\u0432\\u0430\\u043d \\u041f\\u0435\\u0442\\u0440\\u043e\\u0432", "personality": "\\u043d\\u0435\\u0439\\u0442\\u0440\\u0430\\u043b\\u044c\\u043d\\u044b\\u0439, \\u0437\\u0430\\u043d\\u044f\\u0442\\u043e\\u0439", "objections": [], "max_turns": 5}	2026-07-13 11:24:37.825185+00	2026-07-13 11:24:37.852137+00	2026-07-13 11:24:37.836013+00	2026-07-13 11:24:51.587325+00
\.


--
-- Data for Name: sales_campaign_contacts; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.sales_campaign_contacts (id, campaign_id, contact_id, status, called_at) FROM stdin;
1	1	1	called	2026-07-13 11:24:51.595613+00
\.


--
-- Data for Name: sales_campaigns; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.sales_campaigns (id, name, script_id, status, max_calls_per_day, call_interval_seconds, working_hours_start, working_hours_end, created_at, updated_at, started_at, completed_at) FROM stdin;
1	Тестовая кампания	1	active	50	30	09:00	18:00	2026-07-13 11:21:20.522986+00	2026-07-13 11:21:20.621257+00	2026-07-13 11:21:20.6237+00	\N
\.


--
-- Data for Name: sales_contacts; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.sales_contacts (id, name, phone, company, extra_data, created_at) FROM stdin;
1	Иван Петров	+375291234567	ООО Тест	null	2026-07-13 11:14:48.86902+00
\.


--
-- Data for Name: sales_scripts; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.sales_scripts (id, name, description, script_data, system_prompt, created_at, updated_at) FROM stdin;
1	Дикие продажи	Холодный обзвон	{"stages": [{"name": "\\u041a\\u043e\\u043d\\u0442\\u0430\\u043a\\u0442", "goal": "\\u0414\\u043e\\u0433\\u043e\\u0432\\u043e\\u0440\\u0438\\u0442\\u044c\\u0441\\u044f", "script": "...", "branches": {"\\u0434\\u0430": "programming"}}], "greeting": "", "voice": {}, "qualification_criteria": {}}	\N	2026-07-13 11:14:48.843028+00	2026-07-13 11:14:48.843028+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: callanalytics
--

COPY public.users (id, email, username, hashed_password, role, is_active, created_at, updated_at) FROM stdin;
1	admin@example.com	admin	$argon2id$v=19$m=65536,t=3,p=4$cVOh9jnygz3jBknfvfyPjA$PmutfoH+cXabOUrdWc6O2Ok/C+Y3Ksvmz2aqJP0BYcU	ADMIN	t	2026-06-12 13:29:39.491269+00	2026-06-26 10:40:29.692308+00
2	alice@example.com	alice	$argon2id$v=19$m=65536,t=3,p=4$9xE74yLQnjSDSNhWkI9mbQ$vj49GaSkpi+RFknhVlIwUxu02zeorlafIXtHtSs94O0	MANAGER	t	2026-06-12 13:29:39.491269+00	2026-06-26 10:40:29.692308+00
3	bob@example.com	bob	$argon2id$v=19$m=65536,t=3,p=4$wDwO3fIrcfonjuZZyVyIEA$UDhs+SaoomtY19xCHt/b6kM2B6e9RxNbKXsPvJ8q+ps	MANAGER	t	2026-06-12 13:29:39.491269+00	2026-06-26 10:40:29.692308+00
4	charlie@example.com	charlie	$argon2id$v=19$m=65536,t=3,p=4$RNxgGH/WzDdMdDPj7kMz0A$5ZSNtq1hy/Kj2133tgc4qfgCiGLcfjaK7dowRRKhVdQ	MANAGER	t	2026-06-12 13:29:39.491269+00	2026-06-26 10:40:29.692308+00
\.


--
-- Name: call_criteria_scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.call_criteria_scores_id_seq', 1, false);


--
-- Name: call_type_criteria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.call_type_criteria_id_seq', 1, false);


--
-- Name: calls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.calls_id_seq', 51, true);


--
-- Name: criteria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.criteria_id_seq', 12, true);


--
-- Name: knowledge_base_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.knowledge_base_id_seq', 1, false);


--
-- Name: sales_calls_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.sales_calls_id_seq', 5, true);


--
-- Name: sales_campaign_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.sales_campaign_contacts_id_seq', 1, true);


--
-- Name: sales_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.sales_campaigns_id_seq', 1, true);


--
-- Name: sales_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.sales_contacts_id_seq', 1, true);


--
-- Name: sales_scripts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.sales_scripts_id_seq', 1, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: call_criteria_scores call_criteria_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.call_criteria_scores
    ADD CONSTRAINT call_criteria_scores_pkey PRIMARY KEY (id);


--
-- Name: call_type_criteria call_type_criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.call_type_criteria
    ADD CONSTRAINT call_type_criteria_pkey PRIMARY KEY (id);


--
-- Name: calls calls_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_pkey PRIMARY KEY (id);


--
-- Name: criteria criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.criteria
    ADD CONSTRAINT criteria_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: sales_calls sales_calls_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_calls
    ADD CONSTRAINT sales_calls_pkey PRIMARY KEY (id);


--
-- Name: sales_campaign_contacts sales_campaign_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_campaign_contacts
    ADD CONSTRAINT sales_campaign_contacts_pkey PRIMARY KEY (id);


--
-- Name: sales_campaigns sales_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_campaigns
    ADD CONSTRAINT sales_campaigns_pkey PRIMARY KEY (id);


--
-- Name: sales_contacts sales_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_contacts
    ADD CONSTRAINT sales_contacts_pkey PRIMARY KEY (id);


--
-- Name: sales_scripts sales_scripts_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_scripts
    ADD CONSTRAINT sales_scripts_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_call_criteria_scores_call_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_call_criteria_scores_call_id ON public.call_criteria_scores USING btree (call_id);


--
-- Name: ix_call_criteria_scores_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_call_criteria_scores_id ON public.call_criteria_scores USING btree (id);


--
-- Name: ix_call_type_criteria_call_type; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_call_type_criteria_call_type ON public.call_type_criteria USING btree (call_type);


--
-- Name: ix_call_type_criteria_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_call_type_criteria_id ON public.call_type_criteria USING btree (id);


--
-- Name: ix_calls_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_calls_id ON public.calls USING btree (id);


--
-- Name: ix_calls_manager_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_calls_manager_id ON public.calls USING btree (manager_id);


--
-- Name: ix_criteria_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_criteria_id ON public.criteria USING btree (id);


--
-- Name: ix_criteria_key; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE UNIQUE INDEX ix_criteria_key ON public.criteria USING btree (key);


--
-- Name: ix_knowledge_base_category; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_knowledge_base_category ON public.knowledge_base USING btree (category);


--
-- Name: ix_knowledge_base_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_knowledge_base_id ON public.knowledge_base USING btree (id);


--
-- Name: ix_sales_calls_campaign_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_calls_campaign_id ON public.sales_calls USING btree (campaign_id);


--
-- Name: ix_sales_calls_contact_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_calls_contact_id ON public.sales_calls USING btree (contact_id);


--
-- Name: ix_sales_calls_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_calls_id ON public.sales_calls USING btree (id);


--
-- Name: ix_sales_campaign_contacts_campaign_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_campaign_contacts_campaign_id ON public.sales_campaign_contacts USING btree (campaign_id);


--
-- Name: ix_sales_campaign_contacts_contact_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_campaign_contacts_contact_id ON public.sales_campaign_contacts USING btree (contact_id);


--
-- Name: ix_sales_campaign_contacts_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_campaign_contacts_id ON public.sales_campaign_contacts USING btree (id);


--
-- Name: ix_sales_campaigns_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_campaigns_id ON public.sales_campaigns USING btree (id);


--
-- Name: ix_sales_campaigns_script_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_campaigns_script_id ON public.sales_campaigns USING btree (script_id);


--
-- Name: ix_sales_contacts_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_contacts_id ON public.sales_contacts USING btree (id);


--
-- Name: ix_sales_contacts_phone; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_contacts_phone ON public.sales_contacts USING btree (phone);


--
-- Name: ix_sales_scripts_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_sales_scripts_id ON public.sales_scripts USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_users_username; Type: INDEX; Schema: public; Owner: callanalytics
--

CREATE UNIQUE INDEX ix_users_username ON public.users USING btree (username);


--
-- Name: call_criteria_scores call_criteria_scores_call_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.call_criteria_scores
    ADD CONSTRAINT call_criteria_scores_call_id_fkey FOREIGN KEY (call_id) REFERENCES public.calls(id) ON DELETE CASCADE;


--
-- Name: call_criteria_scores call_criteria_scores_criteria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.call_criteria_scores
    ADD CONSTRAINT call_criteria_scores_criteria_id_fkey FOREIGN KEY (criteria_id) REFERENCES public.criteria(id) ON DELETE CASCADE;


--
-- Name: call_type_criteria call_type_criteria_criteria_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.call_type_criteria
    ADD CONSTRAINT call_type_criteria_criteria_id_fkey FOREIGN KEY (criteria_id) REFERENCES public.criteria(id) ON DELETE CASCADE;


--
-- Name: calls calls_manager_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.calls
    ADD CONSTRAINT calls_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.users(id);


--
-- Name: sales_calls sales_calls_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_calls
    ADD CONSTRAINT sales_calls_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.sales_campaigns(id);


--
-- Name: sales_calls sales_calls_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_calls
    ADD CONSTRAINT sales_calls_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.sales_contacts(id);


--
-- Name: sales_campaign_contacts sales_campaign_contacts_campaign_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_campaign_contacts
    ADD CONSTRAINT sales_campaign_contacts_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES public.sales_campaigns(id);


--
-- Name: sales_campaign_contacts sales_campaign_contacts_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_campaign_contacts
    ADD CONSTRAINT sales_campaign_contacts_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.sales_contacts(id);


--
-- Name: sales_campaigns sales_campaigns_script_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: callanalytics
--

ALTER TABLE ONLY public.sales_campaigns
    ADD CONSTRAINT sales_campaigns_script_id_fkey FOREIGN KEY (script_id) REFERENCES public.sales_scripts(id);


--
-- PostgreSQL database dump complete
--

\unrestrict CYUWW8mrQgvWAwv6XthhLw4bgsr3QKJmMtjFbe1d7ZDDhFb4ckD2FS0B6QxpYMd

