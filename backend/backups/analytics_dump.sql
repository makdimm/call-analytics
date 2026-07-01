--
-- PostgreSQL database dump
--

\restrict 82IdZqraOLwWLUcVQ37laGn8T68MHfPFPCijHDThZvrasva8PTvYAorDTczGPyl

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

ALTER TABLE IF EXISTS ONLY public.calls DROP CONSTRAINT IF EXISTS calls_manager_id_fkey;
ALTER TABLE IF EXISTS ONLY public.call_type_criteria DROP CONSTRAINT IF EXISTS call_type_criteria_criteria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.call_criteria_scores DROP CONSTRAINT IF EXISTS call_criteria_scores_criteria_id_fkey;
ALTER TABLE IF EXISTS ONLY public.call_criteria_scores DROP CONSTRAINT IF EXISTS call_criteria_scores_call_id_fkey;
DROP INDEX IF EXISTS public.ix_users_username;
DROP INDEX IF EXISTS public.ix_users_id;
DROP INDEX IF EXISTS public.ix_users_email;
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
ALTER TABLE IF EXISTS ONLY public.knowledge_base DROP CONSTRAINT IF EXISTS knowledge_base_pkey;
ALTER TABLE IF EXISTS ONLY public.criteria DROP CONSTRAINT IF EXISTS criteria_pkey;
ALTER TABLE IF EXISTS ONLY public.calls DROP CONSTRAINT IF EXISTS calls_pkey;
ALTER TABLE IF EXISTS ONLY public.call_type_criteria DROP CONSTRAINT IF EXISTS call_type_criteria_pkey;
ALTER TABLE IF EXISTS ONLY public.call_criteria_scores DROP CONSTRAINT IF EXISTS call_criteria_scores_pkey;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.knowledge_base ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.criteria ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.calls ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.call_type_criteria ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.call_criteria_scores ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
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
49	4	kuporosov_andrey_out_79224680656_2026_06_26-08_52_31_nnka.mp3	/app/uploads/1abc3cc3-9ca6-483c-98fe-fb424f8b2256.mp3	325.2200012207031	ANALYZED	Алло. Добрый день. Меня зовут Андрей. День добрый. Организация спецэффект-пром. Оставили заявку наставить ее на обратный звонок. Да. Подскажите, какая техника заинтересовала вас? Что за какая часть? Еще раз, не расслышал. Алло. Да-да-да, слышно меня? Да, слышно. Подскажите, какая техника заинтересовала вас? Топливозаправщик. Топливозаправщик. На базе у вас, артикул 8010 у вас стоит. 8010, сейчас секунду открою. Подскажите, как могу к вам обращаться, как зовут вас? Рамин, я зовут. Рамин, правильно? Рамин. Рамин. А, 8010. Хорошо. То есть, как на сайте устраивает, полтора куба. На базе у вас профиль полноприводного. С одним тараканом, правильно? С чем еще раз? Ну, с одной топливно-раздачной колонкой. Понял, да-да. А, и бывает с двумя, что ли, у вас? Бывает с двумя. С двумя отсеками? С двумя отсеками, да, совершенно верно. Там получается по... Сейчас скажу сколько. То есть, на различные виды топлива. То есть, на дизель, на светлые нефтепродукты и... Ну, если две секции и две раздачные колонки, то да, можно, соответственно, два раздельно возить. И дизель, и бензин. И дизель, и бензин, понял. Да, то есть, вам две секции нужны или одну? Блин, вообще, шикарно было. Две колонки. Две секции и две колонки, да? Две секции, естественно. Если две секции и одна колонка, то что-то это... Разбавлять. Ну да, там немножко, если две колонки... Одну колонку делаешь, то там немножко пересортится, получается. Спуск пропадает на дизеле. Да, да, совершенно верно. Смотрите, сейчас по наличию таких автомобилей нет. Вам как скорая нужна? Чем быстрее, тем лучше. Я могу подготовить предложение где-то в течение 40 рабочих дней. То есть, это... В течение 40 рабочих дней? То есть, в течение двух месяцев? Это минимум, значит, вы изготавливаете только, да? Да, это полностью. Мы берем шасси удювера, ставим бочку и изготавливаем. И по цене сколько выходит? Я могу посчитать. Давайте еще пару вопросов задам. А вы смотрите еще, подождите. А у вас в наличии есть одним отсеком? Нет, сейчас говорю, что такой техники нет по наличию. Все распродали. Был прям буквально недавно продан. Угу. Вот. А вы уже пользуетесь такой техникой? Нет. Скажите. Нет, да? То есть, а... У вас чем предприятия занимаются? Транспортная компания. Еще раз, транспортная? Транспортная, транспортная. Транспорт. То есть, вы хотите подвозить для своей техники, правильно я понимаю? Для своей, конечно. Хорошо. Рамин, а вы из какого города звоните? Янал. Янал. Ямал-Невский автономный округ. Угу. Смотрите, я подготовлю сейчас предложение. Вот с телефона, который вы звоните, там Макс присутствует у вас? Присутствует. Я сейчас туда визитку уже, наверное, ушла у вас визитка. Ну, моя визитка. Просьба прислать адрес электронной почты. Сейчас я проверю, может быть у меня отразился. Нет, у меня нету адрес электронной почты. Я туда отправлю предложение. Со всеми характеристиками подробными. И стоимостью. Вы подскажите, вам доставка нужна будет? Или вы готовы из Нижнего Города? Ну, надо посмотреть еще. Когда, что. Еще понять бы. Ну, то есть, пока я без доставки считаю. Да, да, да. Без доставки. А вот такой вопрос, как организация у вас называется? Подготовочная. Ну, давайте и производим. Именен могу скинуть, если что. Да, конечно. Карточку предприятия могу скинуть. Да, тогда я сейчас напишу в Максе. Вы скиньте, пожалуйста, мне почту и карточку предприятия. Я вам подготовлю или иное коммерческое предложение. Хорошо. У вас по времени от Московского отличается? Два часа. Два часа. В Москве восемь утра, а у нас десять. Угу. Хорошо. Ну, мы тоже уже работаем. Соответственно, плюс два часа я по месту просто поставлю, чтобы вам поздно не звонить. Постараюсь сегодня, сегодня дня вам подготовить. То есть, еще раз поговорим на УАЗе полноприводном профе. Топливозаправщик. Две хексы, чтобы можно было перевозить, перевозить топливо. И две раздачные колонки, правильно? Да. Все, тогда у вас... А у нас есть какие-то вопросы еще? Нет. Все, тогда... Так, коммерческое отправлю, тоже позвоню, увижу, что это пришло. Все хорошо. До свидания. Все, добро. До свидания.	0.95	large-v3	{"call_type": "new_lead", "warmth": "warm", "criteria_scores": {"greeting": 1, "speech": 0.5, "initiative": 0.5, "programming": 0.5, "qualification": 1, "pain": 1, "product": 0.5, "expertise": 0.5, "closing": 0.5, "push": 0, "next_step": 1, "framing": 0.5}, "fg_score": 66.67, "objection_count": 2, "objection_types": ["\\u043d\\u0435\\u0442 \\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u044f", "\\u0446\\u0435\\u043d\\u0430"], "manager_tone": "friendly", "client_tone": "interested", "crm_quality": 0.5, "compliance": {"score": 75, "level": "partial", "details": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043f\\u0440\\u043e\\u044f\\u0432\\u0438\\u043b \\u0438\\u043d\\u0438\\u0446\\u0438\\u0430\\u0442\\u0438\\u0432\\u0443, \\u043d\\u043e \\u043d\\u0435 \\u0432\\u0441\\u0435\\u0433\\u0434\\u0430 \\u0447\\u0435\\u0442\\u043a\\u043e \\u0443\\u043f\\u0440\\u0430\\u0432\\u043b\\u044f\\u043b \\u0434\\u0438\\u0430\\u043b\\u043e\\u0433\\u043e\\u043c \\u0438 \\u043d\\u0435 \\u0437\\u0430\\u043a\\u0440\\u044b\\u043b \\u0441\\u0434\\u0435\\u043b\\u043a\\u0443."}, "summary": "\\u041c\\u0435\\u043d\\u0435\\u0434\\u0436\\u0435\\u0440 \\u043f\\u0440\\u0435\\u0434\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0441\\u044f \\u0438 \\u0432\\u044b\\u044f\\u0441\\u043d\\u0438\\u043b \\u043f\\u043e\\u0442\\u0440\\u0435\\u0431\\u043d\\u043e\\u0441\\u0442\\u0438 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430, \\u043d\\u043e \\u043d\\u0435 \\u0441\\u043c\\u043e\\u0433 \\u043f\\u043e\\u043b\\u043d\\u043e\\u0441\\u0442\\u044c\\u044e \\u0437\\u0430\\u043a\\u0440\\u044b\\u0442\\u044c \\u0441\\u0434\\u0435\\u043b\\u043a\\u0443. \\u041a\\u043b\\u0438\\u0435\\u043d\\u0442 \\u043f\\u0440\\u043e\\u044f\\u0432\\u0438\\u043b \\u0438\\u043d\\u0442\\u0435\\u0440\\u0435\\u0441 \\u043a \\u043f\\u0440\\u043e\\u0434\\u0443\\u043a\\u0442\\u0443, \\u043d\\u043e \\u0435\\u0441\\u0442\\u044c \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b \\u043f\\u043e \\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u044e \\u0438 \\u0446\\u0435\\u043d\\u0435.", "strengths": ["\\u0425\\u043e\\u0440\\u043e\\u0448\\u0435\\u0435 \\u043f\\u0440\\u0438\\u0432\\u0435\\u0442\\u0441\\u0442\\u0432\\u0438\\u0435", "\\u0412\\u044b\\u044f\\u0432\\u043b\\u0435\\u043d\\u0438\\u0435 \\u043f\\u043e\\u0442\\u0440\\u0435\\u0431\\u043d\\u043e\\u0441\\u0442\\u0435\\u0439 \\u043a\\u043b\\u0438\\u0435\\u043d\\u0442\\u0430", "\\u0427\\u0435\\u0442\\u043a\\u043e\\u0435 \\u043d\\u0430\\u0437\\u043d\\u0430\\u0447\\u0435\\u043d\\u0438\\u0435 \\u0441\\u043b\\u0435\\u0434\\u0443\\u044e\\u0449\\u0435\\u0433\\u043e \\u0448\\u0430\\u0433\\u0430"], "growth_areas": ["\\u0423\\u043b\\u0443\\u0447\\u0448\\u0438\\u0442\\u044c \\u0443\\u043f\\u0440\\u0430\\u0432\\u043b\\u0435\\u043d\\u0438\\u0435 \\u0434\\u0438\\u0430\\u043b\\u043e\\u0433\\u043e\\u043c", "\\u0411\\u043e\\u043b\\u0435\\u0435 \\u0434\\u0435\\u0442\\u0430\\u043b\\u044c\\u043d\\u0430\\u044f \\u043f\\u0440\\u0435\\u0437\\u0435\\u043d\\u0442\\u0430\\u0446\\u0438\\u044f \\u043f\\u0440\\u043e\\u0434\\u0443\\u043a\\u0442\\u0430"], "keywords_found": ["\\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a", "\\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u0435", "\\u0446\\u0435\\u043d\\u0430"], "emotions": {"manager_speech_ratio": 59.8}, "conversation": [{"speaker": "client", "text": "\\u0410\\u043b\\u043b\\u043e.", "timestamp": 0}, {"speaker": "manager", "text": "\\u0414\\u043e\\u0431\\u0440\\u044b\\u0439 \\u0434\\u0435\\u043d\\u044c. \\u041c\\u0435\\u043d\\u044f \\u0437\\u043e\\u0432\\u0443\\u0442 \\u0410\\u043d\\u0434\\u0440\\u0435\\u0439.", "timestamp": 2}, {"speaker": "client", "text": "\\u0414\\u0435\\u043d\\u044c \\u0434\\u043e\\u0431\\u0440\\u044b\\u0439.", "timestamp": 4}, {"speaker": "manager", "text": "\\u041e\\u0440\\u0433\\u0430\\u043d\\u0438\\u0437\\u0430\\u0446\\u0438\\u044f \\u0441\\u043f\\u0435\\u0446\\u044d\\u0444\\u0444\\u0435\\u043a\\u0442-\\u043f\\u0440\\u043e\\u043c.", "timestamp": 5}, {"speaker": "manager", "text": "\\u041e\\u0441\\u0442\\u0430\\u0432\\u0438\\u043b\\u0438 \\u0437\\u0430\\u044f\\u0432\\u043a\\u0443 \\u043d\\u0430\\u0441\\u0442\\u0430\\u0432\\u0438\\u0442\\u044c \\u0435\\u0435 \\u043d\\u0430 \\u043e\\u0431\\u0440\\u0430\\u0442\\u043d\\u044b\\u0439 \\u0437\\u0432\\u043e\\u043d\\u043e\\u043a.", "timestamp": 7}, {"speaker": "client", "text": "\\u0414\\u0430.", "timestamp": 9}, {"speaker": "manager", "text": "\\u041f\\u043e\\u0434\\u0441\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435, \\u043a\\u0430\\u043a\\u0430\\u044f \\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u0430 \\u0437\\u0430\\u0438\\u043d\\u0442\\u0435\\u0440\\u0435\\u0441\\u043e\\u0432\\u0430\\u043b\\u0430 \\u0432\\u0430\\u0441?", "timestamp": 10}, {"speaker": "client", "text": "\\u0427\\u0442\\u043e \\u0437\\u0430 \\u043a\\u0430\\u043a\\u0430\\u044f \\u0447\\u0430\\u0441\\u0442\\u044c?", "timestamp": 14}, {"speaker": "manager", "text": "\\u0415\\u0449\\u0435 \\u0440\\u0430\\u0437, \\u043d\\u0435 \\u0440\\u0430\\u0441\\u0441\\u043b\\u044b\\u0448\\u0430\\u043b.", "timestamp": 16}, {"speaker": "client", "text": "\\u0410\\u043b\\u043b\\u043e.", "timestamp": 19}, {"speaker": "manager", "text": "\\u0414\\u0430-\\u0434\\u0430-\\u0434\\u0430, \\u0441\\u043b\\u044b\\u0448\\u043d\\u043e \\u043c\\u0435\\u043d\\u044f?", "timestamp": 20}, {"speaker": "client", "text": "\\u0414\\u0430, \\u0441\\u043b\\u044b\\u0448\\u043d\\u043e.", "timestamp": 22}, {"speaker": "manager", "text": "\\u041f\\u043e\\u0434\\u0441\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435, \\u043a\\u0430\\u043a\\u0430\\u044f \\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u0430 \\u0437\\u0430\\u0438\\u043d\\u0442\\u0435\\u0440\\u0435\\u0441\\u043e\\u0432\\u0430\\u043b\\u0430 \\u0432\\u0430\\u0441?", "timestamp": 24}, {"speaker": "client", "text": "\\u0422\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a.", "timestamp": 28}, {"speaker": "client", "text": "\\u0422\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a.", "timestamp": 31}, {"speaker": "manager", "text": "\\u041d\\u0430 \\u0431\\u0430\\u0437\\u0435 \\u0443 \\u0432\\u0430\\u0441, \\u0430\\u0440\\u0442\\u0438\\u043a\\u0443\\u043b 8010 \\u0443 \\u0432\\u0430\\u0441 \\u0441\\u0442\\u043e\\u0438\\u0442.", "timestamp": 33}, {"speaker": "manager", "text": "8010, \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0441\\u0435\\u043a\\u0443\\u043d\\u0434\\u0443 \\u043e\\u0442\\u043a\\u0440\\u043e\\u044e.", "timestamp": 38}, {"speaker": "manager", "text": "\\u041f\\u043e\\u0434\\u0441\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435, \\u043a\\u0430\\u043a \\u043c\\u043e\\u0433\\u0443 \\u043a \\u0432\\u0430\\u043c \\u043e\\u0431\\u0440\\u0430\\u0449\\u0430\\u0442\\u044c\\u0441\\u044f, \\u043a\\u0430\\u043a \\u0437\\u043e\\u0432\\u0443\\u0442 \\u0432\\u0430\\u0441?", "timestamp": 41}, {"speaker": "client", "text": "\\u0420\\u0430\\u043c\\u0438\\u043d, \\u044f \\u0437\\u043e\\u0432\\u0443\\u0442.", "timestamp": 44}, {"speaker": "manager", "text": "\\u0420\\u0430\\u043c\\u0438\\u043d, \\u043f\\u0440\\u0430\\u0432\\u0438\\u043b\\u044c\\u043d\\u043e?", "timestamp": 45}, {"speaker": "client", "text": "\\u0420\\u0430\\u043c\\u0438\\u043d.", "timestamp": 47}, {"speaker": "client", "text": "\\u0420\\u0430\\u043c\\u0438\\u043d.", "timestamp": 49}, {"speaker": "manager", "text": "\\u0410, 8010.", "timestamp": 51}, {"speaker": "client", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e.", "timestamp": 54}, {"speaker": "client", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u043a\\u0430\\u043a \\u043d\\u0430 \\u0441\\u0430\\u0439\\u0442\\u0435 \\u0443\\u0441\\u0442\\u0440\\u0430\\u0438\\u0432\\u0430\\u0435\\u0442, \\u043f\\u043e\\u043b\\u0442\\u043e\\u0440\\u0430 \\u043a\\u0443\\u0431\\u0430.", "timestamp": 55}, {"speaker": "client", "text": "\\u041d\\u0430 \\u0431\\u0430\\u0437\\u0435 \\u0443 \\u0432\\u0430\\u0441 \\u043f\\u0440\\u043e\\u0444\\u0438\\u043b\\u044c \\u043f\\u043e\\u043b\\u043d\\u043e\\u043f\\u0440\\u0438\\u0432\\u043e\\u0434\\u043d\\u043e\\u0433\\u043e.", "timestamp": 58}, {"speaker": "client", "text": "\\u0421 \\u043e\\u0434\\u043d\\u0438\\u043c \\u0442\\u0430\\u0440\\u0430\\u043a\\u0430\\u043d\\u043e\\u043c, \\u043f\\u0440\\u0430\\u0432\\u0438\\u043b\\u044c\\u043d\\u043e?", "timestamp": 61}, {"speaker": "manager", "text": "\\u0421 \\u0447\\u0435\\u043c \\u0435\\u0449\\u0435 \\u0440\\u0430\\u0437?", "timestamp": 64}, {"speaker": "client", "text": "\\u041d\\u0443, \\u0441 \\u043e\\u0434\\u043d\\u043e\\u0439 \\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u043d\\u043e-\\u0440\\u0430\\u0437\\u0434\\u0430\\u0447\\u043d\\u043e\\u0439 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u043e\\u0439.", "timestamp": 66}, {"speaker": "manager", "text": "\\u041f\\u043e\\u043d\\u044f\\u043b, \\u0434\\u0430-\\u0434\\u0430.", "timestamp": 71}, {"speaker": "client", "text": "\\u0410, \\u0438 \\u0431\\u044b\\u0432\\u0430\\u0435\\u0442 \\u0441 \\u0434\\u0432\\u0443\\u043c\\u044f, \\u0447\\u0442\\u043e \\u043b\\u0438, \\u0443 \\u0432\\u0430\\u0441?", "timestamp": 74}, {"speaker": "manager", "text": "\\u0411\\u044b\\u0432\\u0430\\u0435\\u0442 \\u0441 \\u0434\\u0432\\u0443\\u043c\\u044f.", "timestamp": 75}, {"speaker": "client", "text": "\\u0421 \\u0434\\u0432\\u0443\\u043c\\u044f \\u043e\\u0442\\u0441\\u0435\\u043a\\u0430\\u043c\\u0438?", "timestamp": 76}, {"speaker": "manager", "text": "\\u0421 \\u0434\\u0432\\u0443\\u043c\\u044f \\u043e\\u0442\\u0441\\u0435\\u043a\\u0430\\u043c\\u0438, \\u0434\\u0430, \\u0441\\u043e\\u0432\\u0435\\u0440\\u0448\\u0435\\u043d\\u043d\\u043e \\u0432\\u0435\\u0440\\u043d\\u043e.", "timestamp": 78}, {"speaker": "manager", "text": "\\u0422\\u0430\\u043c \\u043f\\u043e\\u043b\\u0443\\u0447\\u0430\\u0435\\u0442\\u0441\\u044f \\u043f\\u043e...", "timestamp": 80}, {"speaker": "manager", "text": "\\u0421\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0441\\u043a\\u0430\\u0436\\u0443 \\u0441\\u043a\\u043e\\u043b\\u044c\\u043a\\u043e.", "timestamp": 82}, {"speaker": "manager", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u043d\\u0430 \\u0440\\u0430\\u0437\\u043b\\u0438\\u0447\\u043d\\u044b\\u0435 \\u0432\\u0438\\u0434\\u044b \\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u0430.", "timestamp": 85}, {"speaker": "manager", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u043d\\u0430 \\u0434\\u0438\\u0437\\u0435\\u043b\\u044c, \\u043d\\u0430 \\u0441\\u0432\\u0435\\u0442\\u043b\\u044b\\u0435 \\u043d\\u0435\\u0444\\u0442\\u0435\\u043f\\u0440\\u043e\\u0434\\u0443\\u043a\\u0442\\u044b \\u0438...", "timestamp": 88}, {"speaker": "manager", "text": "\\u041d\\u0443, \\u0435\\u0441\\u043b\\u0438 \\u0434\\u0432\\u0435 \\u0441\\u0435\\u043a\\u0446\\u0438\\u0438 \\u0438 \\u0434\\u0432\\u0435 \\u0440\\u0430\\u0437\\u0434\\u0430\\u0447\\u043d\\u044b\\u0435 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0438,", "timestamp": 92}, {"speaker": "manager", "text": "\\u0442\\u043e \\u0434\\u0430, \\u043c\\u043e\\u0436\\u043d\\u043e, \\u0441\\u043e\\u043e\\u0442\\u0432\\u0435\\u0442\\u0441\\u0442\\u0432\\u0435\\u043d\\u043d\\u043e, \\u0434\\u0432\\u0430 \\u0440\\u0430\\u0437\\u0434\\u0435\\u043b\\u044c\\u043d\\u043e \\u0432\\u043e\\u0437\\u0438\\u0442\\u044c.", "timestamp": 95}, {"speaker": "manager", "text": "\\u0418 \\u0434\\u0438\\u0437\\u0435\\u043b\\u044c, \\u0438 \\u0431\\u0435\\u043d\\u0437\\u0438\\u043d.", "timestamp": 97}, {"speaker": "client", "text": "\\u0418 \\u0434\\u0438\\u0437\\u0435\\u043b\\u044c, \\u0438 \\u0431\\u0435\\u043d\\u0437\\u0438\\u043d, \\u043f\\u043e\\u043d\\u044f\\u043b.", "timestamp": 99}, {"speaker": "manager", "text": "\\u0414\\u0430, \\u0442\\u043e \\u0435\\u0441\\u0442\\u044c, \\u0432\\u0430\\u043c \\u0434\\u0432\\u0435 \\u0441\\u0435\\u043a\\u0446\\u0438\\u0438 \\u043d\\u0443\\u0436\\u043d\\u044b \\u0438\\u043b\\u0438 \\u043e\\u0434\\u043d\\u0443?", "timestamp": 103}, {"speaker": "client", "text": "\\u0411\\u043b\\u0438\\u043d, \\u0432\\u043e\\u043e\\u0431\\u0449\\u0435, \\u0448\\u0438\\u043a\\u0430\\u0440\\u043d\\u043e \\u0431\\u044b\\u043b\\u043e.", "timestamp": 106}, {"speaker": "client", "text": "\\u0414\\u0432\\u0435 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0438.", "timestamp": 109}, {"speaker": "manager", "text": "\\u0414\\u0432\\u0435 \\u0441\\u0435\\u043a\\u0446\\u0438\\u0438 \\u0438 \\u0434\\u0432\\u0435 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0438, \\u0434\\u0430?", "timestamp": 111}, {"speaker": "client", "text": "\\u0414\\u0432\\u0435 \\u0441\\u0435\\u043a\\u0446\\u0438\\u0438, \\u0435\\u0441\\u0442\\u0435\\u0441\\u0442\\u0432\\u0435\\u043d\\u043d\\u043e.", "timestamp": 113}, {"speaker": "client", "text": "\\u0415\\u0441\\u043b\\u0438 \\u0434\\u0432\\u0435 \\u0441\\u0435\\u043a\\u0446\\u0438\\u0438 \\u0438 \\u043e\\u0434\\u043d\\u0430 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0430, \\u0442\\u043e \\u0447\\u0442\\u043e-\\u0442\\u043e \\u044d\\u0442\\u043e...", "timestamp": 116}, {"speaker": "manager", "text": "\\u0420\\u0430\\u0437\\u0431\\u0430\\u0432\\u043b\\u044f\\u0442\\u044c.", "timestamp": 118}, {"speaker": "client", "text": "\\u041d\\u0443 \\u0434\\u0430, \\u0442\\u0430\\u043c \\u043d\\u0435\\u043c\\u043d\\u043e\\u0436\\u043a\\u043e, \\u0435\\u0441\\u043b\\u0438 \\u0434\\u0432\\u0435 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0438...", "timestamp": 120}, {"speaker": "client", "text": "\\u041e\\u0434\\u043d\\u0443 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0443 \\u0434\\u0435\\u043b\\u0430\\u0435\\u0448\\u044c, \\u0442\\u043e \\u0442\\u0430\\u043c \\u043d\\u0435\\u043c\\u043d\\u043e\\u0436\\u043a\\u043e \\u043f\\u0435\\u0440\\u0435\\u0441\\u043e\\u0440\\u0442\\u0438\\u0442\\u0441\\u044f, \\u043f\\u043e\\u043b\\u0443\\u0447\\u0430\\u0435\\u0442\\u0441\\u044f.", "timestamp": 124}, {"speaker": "manager", "text": "\\u0421\\u043f\\u0443\\u0441\\u043a \\u043f\\u0440\\u043e\\u043f\\u0430\\u0434\\u0430\\u0435\\u0442 \\u043d\\u0430 \\u0434\\u0438\\u0437\\u0435\\u043b\\u0435.", "timestamp": 128}, {"speaker": "client", "text": "\\u0414\\u0430, \\u0434\\u0430, \\u0441\\u043e\\u0432\\u0435\\u0440\\u0448\\u0435\\u043d\\u043d\\u043e \\u0432\\u0435\\u0440\\u043d\\u043e.", "timestamp": 130}, {"speaker": "manager", "text": "\\u0421\\u043c\\u043e\\u0442\\u0440\\u0438\\u0442\\u0435, \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043f\\u043e \\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u044e \\u0442\\u0430\\u043a\\u0438\\u0445 \\u0430\\u0432\\u0442\\u043e\\u043c\\u043e\\u0431\\u0438\\u043b\\u0435\\u0439 \\u043d\\u0435\\u0442.", "timestamp": 133}, {"speaker": "manager", "text": "\\u0412\\u0430\\u043c \\u043a\\u0430\\u043a \\u0441\\u043a\\u043e\\u0440\\u0430\\u044f \\u043d\\u0443\\u0436\\u043d\\u0430?", "timestamp": 135}, {"speaker": "client", "text": "\\u0427\\u0435\\u043c \\u0431\\u044b\\u0441\\u0442\\u0440\\u0435\\u0435, \\u0442\\u0435\\u043c \\u043b\\u0443\\u0447\\u0448\\u0435.", "timestamp": 138}, {"speaker": "manager", "text": "\\u042f \\u043c\\u043e\\u0433\\u0443 \\u043f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u0438\\u0442\\u044c \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435 \\u0433\\u0434\\u0435-\\u0442\\u043e \\u0432 \\u0442\\u0435\\u0447\\u0435\\u043d\\u0438\\u0435 40 \\u0440\\u0430\\u0431\\u043e\\u0447\\u0438\\u0445 \\u0434\\u043d\\u0435\\u0439.", "timestamp": 139}, {"speaker": "client", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u044d\\u0442\\u043e...", "timestamp": 143}, {"speaker": "client", "text": "\\u0412 \\u0442\\u0435\\u0447\\u0435\\u043d\\u0438\\u0435 40 \\u0440\\u0430\\u0431\\u043e\\u0447\\u0438\\u0445 \\u0434\\u043d\\u0435\\u0439?", "timestamp": 145}, {"speaker": "client", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u0432 \\u0442\\u0435\\u0447\\u0435\\u043d\\u0438\\u0435 \\u0434\\u0432\\u0443\\u0445 \\u043c\\u0435\\u0441\\u044f\\u0446\\u0435\\u0432?", "timestamp": 147}, {"speaker": "client", "text": "\\u042d\\u0442\\u043e \\u043c\\u0438\\u043d\\u0438\\u043c\\u0443\\u043c, \\u0437\\u043d\\u0430\\u0447\\u0438\\u0442, \\u0432\\u044b \\u0438\\u0437\\u0433\\u043e\\u0442\\u0430\\u0432\\u043b\\u0438\\u0432\\u0430\\u0435\\u0442\\u0435 \\u0442\\u043e\\u043b\\u044c\\u043a\\u043e, \\u0434\\u0430?", "timestamp": 149}, {"speaker": "manager", "text": "\\u0414\\u0430, \\u044d\\u0442\\u043e \\u043f\\u043e\\u043b\\u043d\\u043e\\u0441\\u0442\\u044c\\u044e. \\u041c\\u044b \\u0431\\u0435\\u0440\\u0435\\u043c \\u0448\\u0430\\u0441\\u0441\\u0438 \\u0443\\u0434\\u044e\\u0432\\u0435\\u0440\\u0430, \\u0441\\u0442\\u0430\\u0432\\u0438\\u043c \\u0431\\u043e\\u0447\\u043a\\u0443 \\u0438 \\u0438\\u0437\\u0433\\u043e\\u0442\\u0430\\u0432\\u043b\\u0438\\u0432\\u0430\\u0435\\u043c.", "timestamp": 152}, {"speaker": "client", "text": "\\u0418 \\u043f\\u043e \\u0446\\u0435\\u043d\\u0435 \\u0441\\u043a\\u043e\\u043b\\u044c\\u043a\\u043e \\u0432\\u044b\\u0445\\u043e\\u0434\\u0438\\u0442?", "timestamp": 158}, {"speaker": "manager", "text": "\\u042f \\u043c\\u043e\\u0433\\u0443 \\u043f\\u043e\\u0441\\u0447\\u0438\\u0442\\u0430\\u0442\\u044c. \\u0414\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435 \\u0435\\u0449\\u0435 \\u043f\\u0430\\u0440\\u0443 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u043e\\u0432 \\u0437\\u0430\\u0434\\u0430\\u043c.", "timestamp": 161}, {"speaker": "client", "text": "\\u0410 \\u0432\\u044b \\u0441\\u043c\\u043e\\u0442\\u0440\\u0438\\u0442\\u0435 \\u0435\\u0449\\u0435, \\u043f\\u043e\\u0434\\u043e\\u0436\\u0434\\u0438\\u0442\\u0435.", "timestamp": 164}, {"speaker": "manager", "text": "\\u0410 \\u0443 \\u0432\\u0430\\u0441 \\u0432 \\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u0438 \\u0435\\u0441\\u0442\\u044c \\u043e\\u0434\\u043d\\u0438\\u043c \\u043e\\u0442\\u0441\\u0435\\u043a\\u043e\\u043c?", "timestamp": 166}, {"speaker": "client", "text": "\\u041d\\u0435\\u0442, \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0433\\u043e\\u0432\\u043e\\u0440\\u044e, \\u0447\\u0442\\u043e \\u0442\\u0430\\u043a\\u043e\\u0439 \\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u0438 \\u043d\\u0435\\u0442 \\u043f\\u043e \\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u044e. \\u0412\\u0441\\u0435 \\u0440\\u0430\\u0441\\u043f\\u0440\\u043e\\u0434\\u0430\\u043b\\u0438.", "timestamp": 169}, {"speaker": "client", "text": "\\u0411\\u044b\\u043b \\u043f\\u0440\\u044f\\u043c \\u0431\\u0443\\u043a\\u0432\\u0430\\u043b\\u044c\\u043d\\u043e \\u043d\\u0435\\u0434\\u0430\\u0432\\u043d\\u043e \\u043f\\u0440\\u043e\\u0434\\u0430\\u043d.", "timestamp": 173}, {"speaker": "client", "text": "\\u0423\\u0433\\u0443.", "timestamp": 177}, {"speaker": "manager", "text": "\\u0412\\u043e\\u0442.", "timestamp": 179}, {"speaker": "manager", "text": "\\u0410 \\u0432\\u044b \\u0443\\u0436\\u0435 \\u043f\\u043e\\u043b\\u044c\\u0437\\u0443\\u0435\\u0442\\u0435\\u0441\\u044c \\u0442\\u0430\\u043a\\u043e\\u0439 \\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u043e\\u0439?", "timestamp": 181}, {"speaker": "client", "text": "\\u041d\\u0435\\u0442.", "timestamp": 182}, {"speaker": "manager", "text": "\\u0421\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435.", "timestamp": 183}, {"speaker": "client", "text": "\\u041d\\u0435\\u0442, \\u0434\\u0430? \\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u0430...", "timestamp": 185}, {"speaker": "manager", "text": "\\u0423 \\u0432\\u0430\\u0441 \\u0447\\u0435\\u043c \\u043f\\u0440\\u0435\\u0434\\u043f\\u0440\\u0438\\u044f\\u0442\\u0438\\u044f \\u0437\\u0430\\u043d\\u0438\\u043c\\u0430\\u044e\\u0442\\u0441\\u044f?", "timestamp": 188}, {"speaker": "client", "text": "\\u0422\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442\\u043d\\u0430\\u044f \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f.", "timestamp": 191}, {"speaker": "manager", "text": "\\u0415\\u0449\\u0435 \\u0440\\u0430\\u0437, \\u0442\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442\\u043d\\u0430\\u044f?", "timestamp": 192}, {"speaker": "client", "text": "\\u0422\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442\\u043d\\u0430\\u044f, \\u0442\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442\\u043d\\u0430\\u044f.", "timestamp": 194}, {"speaker": "manager", "text": "\\u0422\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442. \\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u0432\\u044b \\u0445\\u043e\\u0442\\u0438\\u0442\\u0435 \\u043f\\u043e\\u0434\\u0432\\u043e\\u0437\\u0438\\u0442\\u044c \\u0434\\u043b\\u044f \\u0441\\u0432\\u043e\\u0435\\u0439 \\u0442\\u0435\\u0445\\u043d\\u0438\\u043a\\u0438, \\u043f\\u0440\\u0430\\u0432\\u0438\\u043b\\u044c\\u043d\\u043e \\u044f \\u043f\\u043e\\u043d\\u0438\\u043c\\u0430\\u044e?", "timestamp": 197}, {"speaker": "client", "text": "\\u0414\\u043b\\u044f \\u0441\\u0432\\u043e\\u0435\\u0439, \\u043a\\u043e\\u043d\\u0435\\u0447\\u043d\\u043e.", "timestamp": 200}, {"speaker": "manager", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e.", "timestamp": 201}, {"speaker": "manager", "text": "\\u0420\\u0430\\u043c\\u0438\\u043d, \\u0430 \\u0432\\u044b \\u0438\\u0437 \\u043a\\u0430\\u043a\\u043e\\u0433\\u043e \\u0433\\u043e\\u0440\\u043e\\u0434\\u0430 \\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u0435?", "timestamp": 204}, {"speaker": "client", "text": "\\u042f\\u043d\\u0430\\u043b.", "timestamp": 207}, {"speaker": "client", "text": "\\u042f\\u043d\\u0430\\u043b.", "timestamp": 208}, {"speaker": "client", "text": "\\u042f\\u043c\\u0430\\u043b-\\u041d\\u0435\\u0432\\u0441\\u043a\\u0438\\u0439 \\u0430\\u0432\\u0442\\u043e\\u043d\\u043e\\u043c\\u043d\\u044b\\u0439 \\u043e\\u043a\\u0440\\u0443\\u0433.", "timestamp": 211}, {"speaker": "client", "text": "\\u0423\\u0433\\u0443.", "timestamp": 212}, {"speaker": "manager", "text": "\\u0421\\u043c\\u043e\\u0442\\u0440\\u0438\\u0442\\u0435, \\u044f \\u043f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u043b\\u044e \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435.", "timestamp": 214}, {"speaker": "manager", "text": "\\u0412\\u043e\\u0442 \\u0441 \\u0442\\u0435\\u043b\\u0435\\u0444\\u043e\\u043d\\u0430, \\u043a\\u043e\\u0442\\u043e\\u0440\\u044b\\u0439 \\u0432\\u044b \\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u0435, \\u0442\\u0430\\u043c \\u041c\\u0430\\u043a\\u0441 \\u043f\\u0440\\u0438\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u0443\\u0435\\u0442 \\u0443 \\u0432\\u0430\\u0441?", "timestamp": 217}, {"speaker": "client", "text": "\\u041f\\u0440\\u0438\\u0441\\u0443\\u0442\\u0441\\u0442\\u0432\\u0443\\u0435\\u0442.", "timestamp": 219}, {"speaker": "manager", "text": "\\u042f \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u0442\\u0443\\u0434\\u0430 \\u0432\\u0438\\u0437\\u0438\\u0442\\u043a\\u0443 \\u0443\\u0436\\u0435, \\u043d\\u0430\\u0432\\u0435\\u0440\\u043d\\u043e\\u0435, \\u0443\\u0448\\u043b\\u0430 \\u0443 \\u0432\\u0430\\u0441 \\u0432\\u0438\\u0437\\u0438\\u0442\\u043a\\u0430.", "timestamp": 222}, {"speaker": "client", "text": "\\u041d\\u0443, \\u043c\\u043e\\u044f \\u0432\\u0438\\u0437\\u0438\\u0442\\u043a\\u0430.", "timestamp": 224}, {"speaker": "manager", "text": "\\u041f\\u0440\\u043e\\u0441\\u044c\\u0431\\u0430 \\u043f\\u0440\\u0438\\u0441\\u043b\\u0430\\u0442\\u044c \\u0430\\u0434\\u0440\\u0435\\u0441 \\u044d\\u043b\\u0435\\u043a\\u0442\\u0440\\u043e\\u043d\\u043d\\u043e\\u0439 \\u043f\\u043e\\u0447\\u0442\\u044b.", "timestamp": 227}, {"speaker": "client", "text": "\\u0421\\u0435\\u0439\\u0447\\u0430\\u0441 \\u044f \\u043f\\u0440\\u043e\\u0432\\u0435\\u0440\\u044e, \\u043c\\u043e\\u0436\\u0435\\u0442 \\u0431\\u044b\\u0442\\u044c \\u0443 \\u043c\\u0435\\u043d\\u044f \\u043e\\u0442\\u0440\\u0430\\u0437\\u0438\\u043b\\u0441\\u044f.", "timestamp": 229}, {"speaker": "client", "text": "\\u041d\\u0435\\u0442, \\u0443 \\u043c\\u0435\\u043d\\u044f \\u043d\\u0435\\u0442\\u0443 \\u0430\\u0434\\u0440\\u0435\\u0441 \\u044d\\u043b\\u0435\\u043a\\u0442\\u0440\\u043e\\u043d\\u043d\\u043e\\u0439 \\u043f\\u043e\\u0447\\u0442\\u044b.", "timestamp": 231}, {"speaker": "manager", "text": "\\u042f \\u0442\\u0443\\u0434\\u0430 \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u044e \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435.", "timestamp": 234}, {"speaker": "manager", "text": "\\u0421\\u043e \\u0432\\u0441\\u0435\\u043c\\u0438 \\u0445\\u0430\\u0440\\u0430\\u043a\\u0442\\u0435\\u0440\\u0438\\u0441\\u0442\\u0438\\u043a\\u0430\\u043c\\u0438 \\u043f\\u043e\\u0434\\u0440\\u043e\\u0431\\u043d\\u044b\\u043c\\u0438.", "timestamp": 237}, {"speaker": "manager", "text": "\\u0418 \\u0441\\u0442\\u043e\\u0438\\u043c\\u043e\\u0441\\u0442\\u044c\\u044e.", "timestamp": 239}, {"speaker": "manager", "text": "\\u0412\\u044b \\u043f\\u043e\\u0434\\u0441\\u043a\\u0430\\u0436\\u0438\\u0442\\u0435, \\u0432\\u0430\\u043c \\u0434\\u043e\\u0441\\u0442\\u0430\\u0432\\u043a\\u0430 \\u043d\\u0443\\u0436\\u043d\\u0430 \\u0431\\u0443\\u0434\\u0435\\u0442?", "timestamp": 241}, {"speaker": "client", "text": "\\u0418\\u043b\\u0438 \\u0432\\u044b \\u0433\\u043e\\u0442\\u043e\\u0432\\u044b \\u0438\\u0437 \\u041d\\u0438\\u0436\\u043d\\u0435\\u0433\\u043e \\u0413\\u043e\\u0440\\u043e\\u0434\\u0430?", "timestamp": 243}, {"speaker": "client", "text": "\\u041d\\u0443, \\u043d\\u0430\\u0434\\u043e \\u043f\\u043e\\u0441\\u043c\\u043e\\u0442\\u0440\\u0435\\u0442\\u044c \\u0435\\u0449\\u0435.", "timestamp": 245}, {"speaker": "client", "text": "\\u041a\\u043e\\u0433\\u0434\\u0430, \\u0447\\u0442\\u043e.", "timestamp": 247}, {"speaker": "client", "text": "\\u0415\\u0449\\u0435 \\u043f\\u043e\\u043d\\u044f\\u0442\\u044c \\u0431\\u044b.", "timestamp": 249}, {"speaker": "client", "text": "\\u041d\\u0443, \\u0442\\u043e \\u0435\\u0441\\u0442\\u044c, \\u043f\\u043e\\u043a\\u0430 \\u044f \\u0431\\u0435\\u0437 \\u0434\\u043e\\u0441\\u0442\\u0430\\u0432\\u043a\\u0438 \\u0441\\u0447\\u0438\\u0442\\u0430\\u044e.", "timestamp": 252}, {"speaker": "client", "text": "\\u0414\\u0430, \\u0434\\u0430, \\u0434\\u0430.", "timestamp": 254}, {"speaker": "client", "text": "\\u0411\\u0435\\u0437 \\u0434\\u043e\\u0441\\u0442\\u0430\\u0432\\u043a\\u0438.", "timestamp": 256}, {"speaker": "manager", "text": "\\u0410 \\u0432\\u043e\\u0442 \\u0442\\u0430\\u043a\\u043e\\u0439 \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441, \\u043a\\u0430\\u043a \\u043e\\u0440\\u0433\\u0430\\u043d\\u0438\\u0437\\u0430\\u0446\\u0438\\u044f \\u0443 \\u0432\\u0430\\u0441 \\u043d\\u0430\\u0437\\u044b\\u0432\\u0430\\u0435\\u0442\\u0441\\u044f?", "timestamp": 259}, {"speaker": "client", "text": "\\u041f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u043e\\u0447\\u043d\\u0430\\u044f.", "timestamp": 260}, {"speaker": "manager", "text": "\\u041d\\u0443, \\u0434\\u0430\\u0432\\u0430\\u0439\\u0442\\u0435 \\u0438 \\u043f\\u0440\\u043e\\u0438\\u0437\\u0432\\u043e\\u0434\\u0438\\u043c.", "timestamp": 262}, {"speaker": "client", "text": "\\u0418\\u043c\\u0435\\u043d\\u0435\\u043d \\u043c\\u043e\\u0433\\u0443 \\u0441\\u043a\\u0438\\u043d\\u0443\\u0442\\u044c, \\u0435\\u0441\\u043b\\u0438 \\u0447\\u0442\\u043e.", "timestamp": 264}, {"speaker": "manager", "text": "\\u0414\\u0430, \\u043a\\u043e\\u043d\\u0435\\u0447\\u043d\\u043e.", "timestamp": 265}, {"speaker": "client", "text": "\\u041a\\u0430\\u0440\\u0442\\u043e\\u0447\\u043a\\u0443 \\u043f\\u0440\\u0435\\u0434\\u043f\\u0440\\u0438\\u044f\\u0442\\u0438\\u044f \\u043c\\u043e\\u0433\\u0443 \\u0441\\u043a\\u0438\\u043d\\u0443\\u0442\\u044c.", "timestamp": 268}, {"speaker": "manager", "text": "\\u0414\\u0430, \\u0442\\u043e\\u0433\\u0434\\u0430 \\u044f \\u0441\\u0435\\u0439\\u0447\\u0430\\u0441 \\u043d\\u0430\\u043f\\u0438\\u0448\\u0443 \\u0432 \\u041c\\u0430\\u043a\\u0441\\u0435.", "timestamp": 270}, {"speaker": "manager", "text": "\\u0412\\u044b \\u0441\\u043a\\u0438\\u043d\\u044c\\u0442\\u0435, \\u043f\\u043e\\u0436\\u0430\\u043b\\u0443\\u0439\\u0441\\u0442\\u0430, \\u043c\\u043d\\u0435 \\u043f\\u043e\\u0447\\u0442\\u0443 \\u0438 \\u043a\\u0430\\u0440\\u0442\\u043e\\u0447\\u043a\\u0443 \\u043f\\u0440\\u0435\\u0434\\u043f\\u0440\\u0438\\u044f\\u0442\\u0438\\u044f.", "timestamp": 273}, {"speaker": "manager", "text": "\\u042f \\u0432\\u0430\\u043c \\u043f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u043b\\u044e \\u0438\\u043b\\u0438 \\u0438\\u043d\\u043e\\u0435 \\u043a\\u043e\\u043c\\u043c\\u0435\\u0440\\u0447\\u0435\\u0441\\u043a\\u043e\\u0435 \\u043f\\u0440\\u0435\\u0434\\u043b\\u043e\\u0436\\u0435\\u043d\\u0438\\u0435.", "timestamp": 276}, {"speaker": "client", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e.", "timestamp": 277}, {"speaker": "manager", "text": "\\u0423 \\u0432\\u0430\\u0441 \\u043f\\u043e \\u0432\\u0440\\u0435\\u043c\\u0435\\u043d\\u0438 \\u043e\\u0442 \\u041c\\u043e\\u0441\\u043a\\u043e\\u0432\\u0441\\u043a\\u043e\\u0433\\u043e \\u043e\\u0442\\u043b\\u0438\\u0447\\u0430\\u0435\\u0442\\u0441\\u044f?", "timestamp": 280}, {"speaker": "client", "text": "\\u0414\\u0432\\u0430 \\u0447\\u0430\\u0441\\u0430.", "timestamp": 282}, {"speaker": "client", "text": "\\u0414\\u0432\\u0430 \\u0447\\u0430\\u0441\\u0430.", "timestamp": 283}, {"speaker": "client", "text": "\\u0412 \\u041c\\u043e\\u0441\\u043a\\u0432\\u0435 \\u0432\\u043e\\u0441\\u0435\\u043c\\u044c \\u0443\\u0442\\u0440\\u0430, \\u0430 \\u0443 \\u043d\\u0430\\u0441 \\u0434\\u0435\\u0441\\u044f\\u0442\\u044c.", "timestamp": 285}, {"speaker": "client", "text": "\\u0423\\u0433\\u0443.", "timestamp": 286}, {"speaker": "manager", "text": "\\u0425\\u043e\\u0440\\u043e\\u0448\\u043e.", "timestamp": 287}, {"speaker": "manager", "text": "\\u041d\\u0443, \\u043c\\u044b \\u0442\\u043e\\u0436\\u0435 \\u0443\\u0436\\u0435 \\u0440\\u0430\\u0431\\u043e\\u0442\\u0430\\u0435\\u043c.", "timestamp": 288}, {"speaker": "manager", "text": "\\u0421\\u043e\\u043e\\u0442\\u0432\\u0435\\u0442\\u0441\\u0442\\u0432\\u0435\\u043d\\u043d\\u043e, \\u043f\\u043b\\u044e\\u0441 \\u0434\\u0432\\u0430 \\u0447\\u0430\\u0441\\u0430 \\u044f \\u043f\\u043e \\u043c\\u0435\\u0441\\u0442\\u0443 \\u043f\\u0440\\u043e\\u0441\\u0442\\u043e \\u043f\\u043e\\u0441\\u0442\\u0430\\u0432\\u043b\\u044e,", "timestamp": 290}, {"speaker": "manager", "text": "\\u0447\\u0442\\u043e\\u0431\\u044b \\u0432\\u0430\\u043c \\u043f\\u043e\\u0437\\u0434\\u043d\\u043e \\u043d\\u0435 \\u0437\\u0432\\u043e\\u043d\\u0438\\u0442\\u044c.", "timestamp": 293}, {"speaker": "manager", "text": "\\u041f\\u043e\\u0441\\u0442\\u0430\\u0440\\u0430\\u044e\\u0441\\u044c \\u0441\\u0435\\u0433\\u043e\\u0434\\u043d\\u044f, \\u0441\\u0435\\u0433\\u043e\\u0434\\u043d\\u044f \\u0434\\u043d\\u044f \\u0432\\u0430\\u043c \\u043f\\u043e\\u0434\\u0433\\u043e\\u0442\\u043e\\u0432\\u0438\\u0442\\u044c.", "timestamp": 296}, {"speaker": "manager", "text": "\\u0422\\u043e \\u0435\\u0441\\u0442\\u044c, \\u0435\\u0449\\u0435 \\u0440\\u0430\\u0437 \\u043f\\u043e\\u0433\\u043e\\u0432\\u043e\\u0440\\u0438\\u043c \\u043d\\u0430 \\u0423\\u0410\\u0417\\u0435 \\u043f\\u043e\\u043b\\u043d\\u043e\\u043f\\u0440\\u0438\\u0432\\u043e\\u0434\\u043d\\u043e\\u043c \\u043f\\u0440\\u043e\\u0444\\u0435.", "timestamp": 299}, {"speaker": "manager", "text": "\\u0422\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a.", "timestamp": 301}, {"speaker": "manager", "text": "\\u0414\\u0432\\u0435 \\u0445\\u0435\\u043a\\u0441\\u044b, \\u0447\\u0442\\u043e\\u0431\\u044b \\u043c\\u043e\\u0436\\u043d\\u043e \\u0431\\u044b\\u043b\\u043e \\u043f\\u0435\\u0440\\u0435\\u0432\\u043e\\u0437\\u0438\\u0442\\u044c,", "timestamp": 303}, {"speaker": "manager", "text": "\\u043f\\u0435\\u0440\\u0435\\u0432\\u043e\\u0437\\u0438\\u0442\\u044c \\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e.", "timestamp": 304}, {"speaker": "client", "text": "\\u0418 \\u0434\\u0432\\u0435 \\u0440\\u0430\\u0437\\u0434\\u0430\\u0447\\u043d\\u044b\\u0435 \\u043a\\u043e\\u043b\\u043e\\u043d\\u043a\\u0438, \\u043f\\u0440\\u0430\\u0432\\u0438\\u043b\\u044c\\u043d\\u043e?", "timestamp": 305}, {"speaker": "client", "text": "\\u0414\\u0430.", "timestamp": 308}, {"speaker": "manager", "text": "\\u0412\\u0441\\u0435, \\u0442\\u043e\\u0433\\u0434\\u0430 \\u0443 \\u0432\\u0430\\u0441...", "timestamp": 310}, {"speaker": "manager", "text": "\\u0410 \\u0443 \\u043d\\u0430\\u0441 \\u0435\\u0441\\u0442\\u044c \\u043a\\u0430\\u043a\\u0438\\u0435-\\u0442\\u043e \\u0432\\u043e\\u043f\\u0440\\u043e\\u0441\\u044b \\u0435\\u0449\\u0435?", "timestamp": 312}, {"speaker": "client", "text": "\\u041d\\u0435\\u0442.", "timestamp": 314}, {"speaker": "manager", "text": "\\u0412\\u0441\\u0435, \\u0442\\u043e\\u0433\\u0434\\u0430...", "timestamp": 316}, {"speaker": "manager", "text": "\\u0422\\u0430\\u043a, \\u043a\\u043e\\u043c\\u043c\\u0435\\u0440\\u0447\\u0435\\u0441\\u043a\\u043e\\u0435 \\u043e\\u0442\\u043f\\u0440\\u0430\\u0432\\u043b\\u044e, \\u0442\\u043e\\u0436\\u0435 \\u043f\\u043e\\u0437\\u0432\\u043e\\u043d\\u044e,", "timestamp": 319}, {"speaker": "manager", "text": "\\u0443\\u0432\\u0438\\u0436\\u0443, \\u0447\\u0442\\u043e \\u044d\\u0442\\u043e \\u043f\\u0440\\u0438\\u0448\\u043b\\u043e.", "timestamp": 320}, {"speaker": "client", "text": "\\u0412\\u0441\\u0435 \\u0445\\u043e\\u0440\\u043e\\u0448\\u043e.", "timestamp": 321}, {"speaker": "client", "text": "\\u0414\\u043e \\u0441\\u0432\\u0438\\u0434\\u0430\\u043d\\u0438\\u044f.", "timestamp": 322}, {"speaker": "manager", "text": "\\u0412\\u0441\\u0435, \\u0434\\u043e\\u0431\\u0440\\u043e.", "timestamp": 323}, {"speaker": "client", "text": "\\u0414\\u043e \\u0441\\u0432\\u0438\\u0434\\u0430\\u043d\\u0438\\u044f.", "timestamp": 324}], "client_data": {"request": "\\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a", "income_source": "\\u0442\\u0440\\u0430\\u043d\\u0441\\u043f\\u043e\\u0440\\u0442\\u043d\\u0430\\u044f \\u043a\\u043e\\u043c\\u043f\\u0430\\u043d\\u0438\\u044f", "age": null, "city": "\\u042f\\u043d\\u0430\\u043b", "purchase_readiness": "\\u0441\\u0440\\u0435\\u0434\\u043d\\u044f\\u044f", "main_objections": ["\\u043d\\u0435\\u0442 \\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u044f", "\\u0446\\u0435\\u043d\\u0430"], "result_timeline": "\\u0432 \\u0442\\u0435\\u0447\\u0435\\u043d\\u0438\\u0435 40 \\u0440\\u0430\\u0431\\u043e\\u0447\\u0438\\u0445 \\u0434\\u043d\\u0435\\u0439"}}	PARTIAL	75	59.8	{"manager_speech_ratio": 65}	["\\u0442\\u043e\\u043f\\u043b\\u0438\\u0432\\u043e\\u0437\\u0430\\u043f\\u0440\\u0430\\u0432\\u0449\\u0438\\u043a", "\\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u0435", "\\u0446\\u0435\\u043d\\u0430"]	{"count": 2, "types": ["\\u043d\\u0435\\u0442 \\u043d\\u0430\\u043b\\u0438\\u0447\\u0438\\u044f", "\\u0446\\u0435\\u043d\\u0430"], "handled": true}	upload	\N	2026-06-29 14:15:44.623899+00	2026-06-29 14:20:29.262224+00	2026-06-29 14:16:50.051747+00	20	new_lead	f
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

SELECT pg_catalog.setval('public.calls_id_seq', 49, true);


--
-- Name: criteria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.criteria_id_seq', 12, true);


--
-- Name: knowledge_base_id_seq; Type: SEQUENCE SET; Schema: public; Owner: callanalytics
--

SELECT pg_catalog.setval('public.knowledge_base_id_seq', 1, false);


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
-- PostgreSQL database dump complete
--

\unrestrict 82IdZqraOLwWLUcVQ37laGn8T68MHfPFPCijHDThZvrasva8PTvYAorDTczGPyl

