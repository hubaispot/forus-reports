import { useState, useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ─── RAW DEAL DATA (fetched 25 Sep 2026) ─────────────────────────────────────
// Stages: 5381718219 + 5381718220 = Application received | 756357056 = Won
const RAW_DEALS = [
  { id:"513338051827", dealname:"Text Production - Online Anytime 1:1 (5N1422 OA DBU) -  for Serena O'Kane", createdate:"2026-07-27T09:21:16Z", stage:"app", amount:295 },
  { id:"513226249429", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Michelle Healy", createdate:"2026-07-27T09:27:43Z", stage:"app", amount:440 },
  { id:"513367669951", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Michelle Healy", createdate:"2026-07-27T11:25:29Z", stage:"won", amount:440 },
  { id:"513310049518", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Niamh Culleton", createdate:"2026-07-27T12:00:08Z", stage:"app", amount:455 },
  { id:"513446036726", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Thays Dutra", createdate:"2026-07-27T22:40:51Z", stage:"app", amount:295 },
  { id:"513644798154", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Srebrenka Stojanovic", createdate:"2026-07-28T15:09:15Z", stage:"app", amount:295 },
  { id:"513684338903", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Kathleen Gallagher", createdate:"2026-07-28T17:33:04Z", stage:"app", amount:295 },
  { id:"513618836721", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Marie O Sullivan O Shea", createdate:"2026-07-28T22:42:46Z", stage:"app", amount:440 },
  { id:"513760180424", dealname:"Communications (Healthcare) - Online Anytime 1:1 (5N0690 OA DHC) -  for Bernadette Bates", createdate:"2026-07-29T09:48:46Z", stage:"won", amount:295 },
  { id:"513800589540", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Anna Doherty", createdate:"2026-07-29T13:04:45Z", stage:"app", amount:295 },
  { id:"513809827003", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Aoife Brady", createdate:"2026-07-29T14:41:31Z", stage:"won", amount:440 },
  { id:"513886780657", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rebecca Davis", createdate:"2026-07-30T09:24:06Z", stage:"app", amount:440 },
  { id:"514024872150", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Amy Verling", createdate:"2026-07-30T18:02:46Z", stage:"app", amount:440 },
  { id:"514032645322", dealname:"Challenging Behaviour - Online Anytime 1:1 (5N1706 OA DSC) -  for Alona Trach", createdate:"2026-07-31T07:24:58Z", stage:"app", amount:380 },
  { id:"513995007213", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aoife Desmond", createdate:"2026-07-31T11:52:46Z", stage:"won", amount:440 },
  { id:"514085424335", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Annalee Nallen", createdate:"2026-07-31T11:54:17Z", stage:"app", amount:440 },
  { id:"514315556034", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Chantel Kenny", createdate:"2026-07-31T17:35:07Z", stage:"won", amount:440 },
  { id:"514647626980", dealname:"Challenging Behaviour - Online Anytime 1:1 (5N1706 OA DSC) -  for Alona Trach", createdate:"2026-08-01T11:55:12Z", stage:"won", amount:380 },
  { id:"514669152498", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Marie O Shea", createdate:"2026-08-01T13:09:17Z", stage:"won", amount:440 },
  { id:"514487172322", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Shauna Quinn", createdate:"2026-08-01T14:09:53Z", stage:"won", amount:455 },
  { id:"514915505395", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Tara Lacken", createdate:"2026-08-03T14:54:11Z", stage:"won", amount:295 },
  { id:"515024401639", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Abhiroop Bhattacharya", createdate:"2026-08-04T12:05:33Z", stage:"app", amount:440 },
  { id:"515000555759", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Melanie Ludlow Roche", createdate:"2026-08-04T12:56:24Z", stage:"won", amount:440 },
  { id:"515039198457", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ellie O Sullivan", createdate:"2026-08-04T13:45:10Z", stage:"app", amount:440 },
  { id:"515003758786", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Elizabeth Mcmahon", createdate:"2026-08-04T14:04:18Z", stage:"app", amount:455 },
  { id:"515032031451", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Vivien Parker", createdate:"2026-08-04T14:26:50Z", stage:"won", amount:295 },
  { id:"515039868096", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Sorcha O Dea", createdate:"2026-08-04T14:43:44Z", stage:"app", amount:295 },
  { id:"515062784216", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Jamie Scanlon", createdate:"2026-08-04T20:55:32Z", stage:"app", amount:440 },
  { id:"515108743382", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Michael Coughlan", createdate:"2026-08-05T10:55:10Z", stage:"app", amount:295 },
  { id:"515101555957", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Michael Coughlan", createdate:"2026-08-05T11:15:18Z", stage:"won", amount:295 },
  { id:"515052622020", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Blueson Biju", createdate:"2026-08-05T16:00:40Z", stage:"app", amount:295 },
  { id:"515131712727", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Blueson Biju", createdate:"2026-08-05T16:11:46Z", stage:"won", amount:295 },
  { id:"515213477113", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Blueson Biju", createdate:"2026-08-05T16:29:49Z", stage:"won", amount:295 },
  { id:"515201299673", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Juan Gabriel Cordoba", createdate:"2026-08-05T17:36:30Z", stage:"app", amount:295 },
  { id:"515204935893", dealname:"Infection Prevention and Control - Online Anytime 1:1 (5N3734 OA DHC) -  for Professor Magarai", createdate:"2026-08-05T19:38:18Z", stage:"won", amount:295 },
  { id:"515167935704", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for  ", createdate:"2026-08-06T09:43:33Z", stage:"won", amount:440 },
  { id:"515261380806", dealname:"Barista training (1169 CNY DBU) - Mullingar for Treasa Shaw", createdate:"2026-08-06T21:23:47Z", stage:"app", amount:0 },
  { id:"515350230238", dealname:"Barista training (1169 CNY DBU) - Mullingar for Beth Atli", createdate:"2026-08-07T09:27:08Z", stage:"app", amount:0 },
  { id:"515350260943", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Siobhan Doherty", createdate:"2026-08-07T09:33:19Z", stage:"app", amount:440 },
  { id:"515277684977", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Ailish Harkin", createdate:"2026-08-07T10:26:16Z", stage:"won", amount:440 },
  { id:"515350870218", dealname:"Business Administration Skills - Online Anytime 1:1 (5N1610 OA DBU) -  for Millie Earley", createdate:"2026-08-07T11:16:49Z", stage:"app", amount:295 },
  { id:"515350785219", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Khrystyna Zabolotna", createdate:"2026-08-07T12:29:45Z", stage:"app", amount:440 },
  { id:"515607220467", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Niamh Culleton", createdate:"2026-08-10T13:28:48Z", stage:"won", amount:455 },
  { id:"515633534172", dealname:"Barista training (1169 CNY DBU) - Mullingar for Helen Nannery", createdate:"2026-08-10T19:56:23Z", stage:"app", amount:0 },
  { id:"515738416347", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Thays Dutra", createdate:"2026-08-10T21:34:16Z", stage:"won", amount:295 },
  { id:"515745638608", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Camelia Hangan", createdate:"2026-08-10T22:39:31Z", stage:"app", amount:440 },
  { id:"515811014871", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Lucy Cassidy", createdate:"2026-08-10T23:33:34Z", stage:"won", amount:440 },
  { id:"515773116633", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Cecilia scanlon", createdate:"2026-08-11T09:09:37Z", stage:"won", amount:455 },
  { id:"515757313224", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Sandra O'Brien", createdate:"2026-08-11T12:12:35Z", stage:"won", amount:440 },
  { id:"515739381961", dealname:"Communications (Healthcare) - Online Anytime 1:1 (5N0690 OA DHC) -  for Ashling Fairbrother", createdate:"2026-08-11T12:49:38Z", stage:"app", amount:295 },
  { id:"516108258543", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Fiona Scarlett", createdate:"2026-08-11T15:01:37Z", stage:"app", amount:295 },
  { id:"516056595685", dealname:"Cardiac First Response Community (CFRC CNY DHP) - Mullingar for Scott Hyland", createdate:"2026-08-11T17:35:15Z", stage:"won", amount:170 },
  { id:"516122631359", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Catherine Gogan", createdate:"2026-08-11T20:16:23Z", stage:"app", amount:295 },
  { id:"516116139200", dealname:"Barista training (1169 CNY DBU) - Mullingar for André Marx", createdate:"2026-08-12T05:33:27Z", stage:"won", amount:170 },
  { id:"516070541560", dealname:"Barista training (1169 CNY DBU) - Mullingar for André Marx", createdate:"2026-08-12T05:48:11Z", stage:"app", amount:0 },
  { id:"516260792538", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Patricia O Flynn O Donoghue", createdate:"2026-08-12T06:43:49Z", stage:"won", amount:440 },
  { id:"516382823648", dealname:"Barista training (1169 CNY DBU) - Mullingar for Ciaran Monaghan", createdate:"2026-08-12T16:11:32Z", stage:"app", amount:0 },
  { id:"516384715977", dealname:"Barista training (1169 CNY DBU) - Mullingar for Naomi Wade", createdate:"2026-08-12T18:20:30Z", stage:"won", amount:170 },
  { id:"516447498487", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Valquiria Santos Baptista", createdate:"2026-08-12T19:29:25Z", stage:"won", amount:295 },
  { id:"516467687613", dealname:"Barista training (1169 CNY DBU) - Mullingar for Beth Atli", createdate:"2026-08-12T21:03:52Z", stage:"won", amount:170 },
  { id:"516514982129", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Zak Breen", createdate:"2026-08-13T01:01:04Z", stage:"won", amount:440 },
  { id:"516549595336", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Eimear Dykes", createdate:"2026-08-13T11:51:02Z", stage:"app", amount:440 },
  { id:"516760289480", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Niall Anthony Lombard", createdate:"2026-08-13T20:20:23Z", stage:"app", amount:440 },
  { id:"516730614985", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Rachel Bulman", createdate:"2026-08-13T21:59:57Z", stage:"app", amount:440 },
  { id:"516711154875", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Just wondering is this course online?", createdate:"2026-08-14T06:42:27Z", stage:"app", amount:440 },
  { id:"516702006464", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Gillian Cooney", createdate:"2026-08-14T06:47:14Z", stage:"app", amount:440 },
  { id:"516762553582", dealname:"Barista training (1169 CNY DBU) - Mullingar for Christopher Bookless", createdate:"2026-08-14T08:26:35Z", stage:"won", amount:170 },
  { id:"516700067018", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Gillian Cooney", createdate:"2026-08-14T08:33:12Z", stage:"won", amount:440 },
  { id:"516759207118", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Joanne Strydom", createdate:"2026-08-14T12:21:26Z", stage:"won", amount:295 },
  { id:"516784179446", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Anna Johnston", createdate:"2026-08-14T12:42:41Z", stage:"app", amount:0 },
  { id:"516726169799", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Ciaran Monaghan", createdate:"2026-08-14T12:49:06Z", stage:"won", amount:170 },
  { id:"516796157126", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Anna Johnston", createdate:"2026-08-14T12:58:38Z", stage:"won", amount:170 },
  { id:"516738816235", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Stephen Cranley", createdate:"2026-08-14T13:20:36Z", stage:"won", amount:295 },
  { id:"516733606080", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Saoirse OHagan", createdate:"2026-08-14T16:57:33Z", stage:"won", amount:295 },
  { id:"516879577291", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aisling Bhreathnach", createdate:"2026-08-14T19:10:59Z", stage:"app", amount:440 },
  { id:"516961304824", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Catherine Gogan", createdate:"2026-08-15T10:33:28Z", stage:"won", amount:295 },
  { id:"516907597040", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Mark Lynch", createdate:"2026-08-15T12:54:16Z", stage:"app", amount:0 },
  { id:"516945542375", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Portlaoise for Aobha Doyle Byrne", createdate:"2026-08-15T16:03:07Z", stage:"app", amount:440 },
  { id:"516957986013", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Jill Fleming", createdate:"2026-08-15T17:22:16Z", stage:"app", amount:440 },
  { id:"516905756913", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Anna Shaw Luby", createdate:"2026-08-15T17:58:51Z", stage:"won", amount:170 },
  { id:"516984967378", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Eimear Dykes", createdate:"2026-08-16T15:04:39Z", stage:"won", amount:440 },
  { id:"517052664019", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Melissa Griffin", createdate:"2026-08-16T18:22:56Z", stage:"app", amount:455 },
  { id:"517063805149", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Chloe Bannon", createdate:"2026-08-16T20:32:46Z", stage:"won", amount:170 },
  { id:"517006829805", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Zoe ", createdate:"2026-08-17T09:13:24Z", stage:"won", amount:170 },
  { id:"517029502171", dealname:"Supervisory Management - Online Anytime 1:1 (6N4329 OA DBU) -  for Sonia O Neill", createdate:"2026-08-17T09:58:08Z", stage:"app", amount:380 },
  { id:"517100287178", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Deirdre Murray", createdate:"2026-08-17T11:05:27Z", stage:"won", amount:440 },
  { id:"517056297182", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Leniara Da Silveira", createdate:"2026-08-17T14:48:50Z", stage:"app", amount:295 },
  { id:"517328967893", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Bray for Alison Boyce", createdate:"2026-08-17T21:30:15Z", stage:"won", amount:440 },
  { id:"517272477918", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Kate Quinn", createdate:"2026-08-17T22:16:15Z", stage:"app", amount:295 },
  { id:"517258759365", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Melanie Boazman", createdate:"2026-08-18T09:39:38Z", stage:"app", amount:440 },
  { id:"517239920833", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Jade Oladipo", createdate:"2026-08-18T11:34:48Z", stage:"app", amount:295 },
  { id:"517287497919", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Fiona Collins", createdate:"2026-08-18T12:20:57Z", stage:"app", amount:440 },
  { id:"517431791844", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Amanda Hackett", createdate:"2026-08-18T14:09:57Z", stage:"won", amount:295 },
  { id:"517466641622", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Jorja Yates", createdate:"2026-08-18T14:14:44Z", stage:"app", amount:440 },
  { id:"517507449020", dealname:"Human Growth and Development - Online Anytime 1:1 (5N1279 OA DHC) -  for Maryan ahmed Mohamud", createdate:"2026-08-18T15:54:29Z", stage:"app", amount:295 },
  { id:"517464509650", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Donna Kelly", createdate:"2026-08-18T20:05:02Z", stage:"won", amount:295 },
  { id:"517516869870", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rebecca Gibney", createdate:"2026-08-19T09:16:09Z", stage:"app", amount:440 },
  { id:"517432612059", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rebecca Gibney Armstrong", createdate:"2026-08-19T09:17:40Z", stage:"app", amount:440 },
  { id:"517432909002", dealname:"Psychology - Online Anytime 1:1 (5N0754 OA DHC) -  for Virginia Heneghan", createdate:"2026-08-19T14:01:40Z", stage:"won", amount:295 },
  { id:"517467616448", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sam Crawford", createdate:"2026-08-19T14:31:29Z", stage:"won", amount:440 },
  { id:"517527524571", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Tahlya Kelly", createdate:"2026-08-19T14:34:53Z", stage:"app", amount:295 },
  { id:"517595211977", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Grainne Faulkner", createdate:"2026-08-19T16:39:05Z", stage:"won", amount:440 },
  { id:"517635035348", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Maureen Canavan", createdate:"2026-08-19T16:41:32Z", stage:"app", amount:440 },
  { id:"517653057755", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Michelle McCaul", createdate:"2026-08-19T17:09:26Z", stage:"app", amount:440 },
  { id:"517633286362", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Portlaoise for Andrea Hamm", createdate:"2026-08-19T17:15:03Z", stage:"app", amount:440 },
  { id:"517637959914", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Jack Moore", createdate:"2026-08-19T21:38:51Z", stage:"won", amount:295 },
  { id:"517593017538", dealname:"Nutrition - Online Anytime 1:1 (5N2006 OA DHC) -  for Niamh Kelly", createdate:"2026-08-20T04:22:52Z", stage:"won", amount:295 },
  { id:"517581720803", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Claire Neely", createdate:"2026-08-20T10:19:14Z", stage:"won", amount:440 },
  { id:"517644859608", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Mary Hume", createdate:"2026-08-20T10:49:59Z", stage:"app", amount:295 },
  { id:"517682575585", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Lorraine Monaghan Bird", createdate:"2026-08-20T11:11:01Z", stage:"app", amount:0 },
  { id:"517673131195", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Keifa  Hopkins", createdate:"2026-08-20T12:29:30Z", stage:"won", amount:440 },
  { id:"517735953630", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Richard Dee", createdate:"2026-08-21T08:54:48Z", stage:"won", amount:440 },
  { id:"517738401998", dealname:"Anatomy and Physiology - Online Anytime 1:1 (5N0749 OA DHC) -  for Sarah O'Connor", createdate:"2026-08-21T10:03:54Z", stage:"won", amount:295 },
  { id:"517714877628", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Edel Cassidy", createdate:"2026-08-21T12:28:58Z", stage:"won", amount:440 },
  { id:"517803926770", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for When is the next SNA course Beginning", createdate:"2026-08-22T00:09:34Z", stage:"app", amount:440 },
  { id:"517929195712", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Alistair Elliman", createdate:"2026-08-24T10:10:35Z", stage:"app", amount:440 },
  { id:"518057482470", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Samantha Sykes", createdate:"2026-08-24T20:46:46Z", stage:"app", amount:440 },
  { id:"518068930790", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Debbie Lynskey", createdate:"2026-08-25T12:36:24Z", stage:"app", amount:440 },
  { id:"518006554848", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Laura Gavigan", createdate:"2026-08-25T14:45:38Z", stage:"app", amount:440 },
  { id:"518017307874", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Veronica Streete", createdate:"2026-08-25T15:13:14Z", stage:"app", amount:440 },
  { id:"518081250523", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Síofra Tuffy", createdate:"2026-08-25T17:22:58Z", stage:"app", amount:440 },
  { id:"518284067012", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Bernie Burke", createdate:"2026-08-25T18:23:08Z", stage:"app", amount:440 },
  { id:"518345346261", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Bridget Wickham", createdate:"2026-08-25T18:49:21Z", stage:"app", amount:440 },
  { id:"518312341726", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Elaine Tully", createdate:"2026-08-25T20:04:03Z", stage:"app", amount:440 },
  { id:"518320191705", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Frances Brosnan", createdate:"2026-08-25T20:22:48Z", stage:"app", amount:440 },
  { id:"518424805567", dealname:"Understanding Mental Health - Online Anytime 1:1 (5N3772 OA DHC) -  for Hayley Cunningham", createdate:"2026-08-26T05:23:08Z", stage:"app", amount:295 },
  { id:"518371012802", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Fern Bohill", createdate:"2026-08-26T06:07:09Z", stage:"app", amount:440 },
  { id:"518435636461", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Clare Wilson", createdate:"2026-08-26T06:42:28Z", stage:"app", amount:440 },
  { id:"518362045664", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aimee Slattery", createdate:"2026-08-26T07:04:11Z", stage:"won", amount:440 },
  { id:"518378645711", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Fern Bohill", createdate:"2026-08-26T08:37:35Z", stage:"won", amount:440 },
  { id:"518415504601", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for  ", createdate:"2026-08-26T11:00:14Z", stage:"won", amount:440 },
  { id:"518479224027", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Alana Casey", createdate:"2026-08-26T13:06:10Z", stage:"app", amount:295 },
  { id:"518539073744", dealname:"Psychology - Online Anytime 1:1 (5N0754 OA DHC) -  for Fiona Larkin", createdate:"2026-08-26T13:11:41Z", stage:"app", amount:295 },
  { id:"518467740912", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Jovanna Maria Fernandes Reis", createdate:"2026-08-26T13:18:31Z", stage:"app", amount:295 },
  { id:"518391580890", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lauren Devine", createdate:"2026-08-26T13:23:19Z", stage:"app", amount:440 },
  { id:"518445093070", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Paula Sheridan", createdate:"2026-08-26T14:12:05Z", stage:"app", amount:440 },
  { id:"518436133061", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for trudy walsh", createdate:"2026-08-26T14:26:03Z", stage:"app", amount:440 },
  { id:"518395298034", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Catherine Harkin", createdate:"2026-08-26T16:01:41Z", stage:"app", amount:440 },
  { id:"518474564821", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Danielle Daltin", createdate:"2026-08-26T17:15:45Z", stage:"app", amount:440 },
  { id:"518553456877", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Shauna Mcdonnell", createdate:"2026-08-26T17:57:05Z", stage:"app", amount:440 },
  { id:"518384438488", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rebecca Gibney Armstrong", createdate:"2026-08-26T19:01:06Z", stage:"won", amount:440 },
  { id:"518557074678", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Nicola OHIGGINS", createdate:"2026-08-26T19:31:08Z", stage:"app", amount:295 },
  { id:"518463197393", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Trudy Walsh", createdate:"2026-08-26T20:11:47Z", stage:"app", amount:440 },
  { id:"518479565025", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Claire Randles", createdate:"2026-08-26T20:14:02Z", stage:"app", amount:440 },
  { id:"518453047519", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Eireann Tierney", createdate:"2026-08-27T10:15:23Z", stage:"won", amount:440 },
  { id:"518388778189", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Emily Hanratty", createdate:"2026-08-27T10:34:24Z", stage:"won", amount:440 },
  { id:"518594364635", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Katie O'Connor", createdate:"2026-08-27T14:15:58Z", stage:"app", amount:440 },
  { id:"518596236537", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sandra Harvey", createdate:"2026-08-27T15:34:46Z", stage:"app", amount:440 },
  { id:"518579367139", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Liz Gillen", createdate:"2026-08-27T16:05:33Z", stage:"app", amount:440 },
  { id:"518614695136", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lauren Devine", createdate:"2026-08-27T16:26:54Z", stage:"won", amount:440 },
  { id:"518543624388", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for olanrewaju atobatele", createdate:"2026-08-27T17:31:13Z", stage:"app", amount:295 },
  { id:"518616946902", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Joseph Ganley", createdate:"2026-08-27T21:22:33Z", stage:"app", amount:295 },
  { id:"518634707167", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Vicky Connick", createdate:"2026-08-28T07:43:32Z", stage:"won", amount:440 },
  { id:"518634840283", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Mairèad Kinsella", createdate:"2026-08-28T08:27:54Z", stage:"app", amount:440 },
  { id:"518580017340", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Majella McGlinchey Boylan", createdate:"2026-08-28T08:42:41Z", stage:"app", amount:440 },
  { id:"518560598224", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Geraldine East", createdate:"2026-08-28T10:02:16Z", stage:"app", amount:440 },
  { id:"518653368506", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Tina Hagan", createdate:"2026-08-28T10:38:20Z", stage:"won", amount:440 },
  { id:"518795955404", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Kathleen Gallagher", createdate:"2026-08-28T15:58:23Z", stage:"won", amount:440 },
  { id:"518877929665", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Tiffany Walsh", createdate:"2026-08-28T18:45:44Z", stage:"app", amount:440 },
  { id:"518879758534", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Sinead Browne", createdate:"2026-08-28T19:42:25Z", stage:"app", amount:440 },
  { id:"518924043470", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Jessica Hickey", createdate:"2026-08-28T20:40:20Z", stage:"app", amount:295 },
  { id:"518808712412", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Antoinette Walsh", createdate:"2026-08-28T22:10:42Z", stage:"won", amount:440 },
  { id:"518860627135", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Helena McGourty", createdate:"2026-08-29T07:47:16Z", stage:"won", amount:440 },
  { id:"518800065777", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for  ", createdate:"2026-08-29T08:39:32Z", stage:"won", amount:295 },
  { id:"518851733714", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Tasha Quinn", createdate:"2026-08-29T10:54:53Z", stage:"app", amount:440 },
  { id:"518807332048", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Shannon Mcgrath", createdate:"2026-08-29T13:00:26Z", stage:"app", amount:295 },
  { id:"518919213277", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Julia Nevin", createdate:"2026-08-29T13:37:07Z", stage:"app", amount:455 },
  { id:"518855468233", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Elizabeth Sheridan", createdate:"2026-08-29T15:07:19Z", stage:"app", amount:440 },
  { id:"518880516326", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Roisin Browne", createdate:"2026-08-29T20:07:19Z", stage:"app", amount:440 },
  { id:"518825742562", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Kate Farrell", createdate:"2026-08-29T21:47:00Z", stage:"app", amount:295 },
  { id:"518818593994", dealname:"Supervisory Management (Healthcare) - Online Anytime 1:1 (6N4329 OA DHC) -  for Lacramioara Dascalu", createdate:"2026-08-30T00:43:30Z", stage:"app", amount:380 },
  { id:"518820242648", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Caitlin Dempsey", createdate:"2026-08-30T01:00:53Z", stage:"app", amount:440 },
  { id:"518942521570", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Paul O keeffe", createdate:"2026-08-30T08:00:13Z", stage:"app", amount:440 },
  { id:"518919888118", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Moira Elwood", createdate:"2026-08-30T11:53:16Z", stage:"app", amount:440 },
  { id:"518861499592", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Catherina O'Shea", createdate:"2026-08-30T12:55:25Z", stage:"app", amount:440 },
  { id:"518827988171", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Catherina O'Shea", createdate:"2026-08-30T13:10:45Z", stage:"won", amount:440 },
  { id:"518829774031", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Kate Farrell", createdate:"2026-08-30T14:07:48Z", stage:"won", amount:295 },
  { id:"518808263879", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Josie O Donnell", createdate:"2026-08-30T20:22:54Z", stage:"app", amount:440 },
  { id:"518960521445", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for madison diver", createdate:"2026-08-30T21:34:22Z", stage:"app", amount:440 },
  { id:"518925493485", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Catherine Carney", createdate:"2026-08-30T22:31:42Z", stage:"won", amount:295 },
  { id:"518965897462", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for catherine Rowan", createdate:"2026-08-31T08:46:57Z", stage:"app", amount:440 },
  { id:"519049663736", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Caroline Thorpe", createdate:"2026-08-31T10:18:48Z", stage:"app", amount:295 },
  { id:"518962748638", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Helen Mcgrane", createdate:"2026-08-31T10:25:37Z", stage:"app", amount:440 },
  { id:"519024515259", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Claire Carr", createdate:"2026-08-31T10:40:14Z", stage:"won", amount:440 },
  { id:"518962980037", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Kathleen O'Sullivan", createdate:"2026-08-31T11:48:13Z", stage:"won", amount:440 },
  { id:"519070392542", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lisa Bourke", createdate:"2026-08-31T15:04:00Z", stage:"app", amount:440 },
  { id:"519080623314", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Graham Clarkin", createdate:"2026-08-31T15:08:14Z", stage:"app", amount:440 },
  { id:"519081115862", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Gilmartin Sarah", createdate:"2026-08-31T15:48:01Z", stage:"app", amount:440 },
  { id:"519073092845", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Samantha McDonald", createdate:"2026-08-31T16:35:19Z", stage:"app", amount:440 },
  { id:"519190316248", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Amy McManus", createdate:"2026-08-31T19:54:38Z", stage:"app", amount:440 },
  { id:"519084966106", dealname:"Human Resources Management - Online Anytime 1:1 (6N3750 OA DBU) -  for Lisa Cullen", createdate:"2026-08-31T20:20:36Z", stage:"app", amount:380 },
  { id:"519123342528", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Luke Wilders", createdate:"2026-08-31T20:28:55Z", stage:"app", amount:295 },
  { id:"519142021368", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Ellen O Connell", createdate:"2026-09-01T08:07:32Z", stage:"app", amount:295 },
  { id:"519222464744", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Aleisha Kinneen", createdate:"2026-09-01T08:18:44Z", stage:"won", amount:440 },
  { id:"519169155294", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Ellen O Connell", createdate:"2026-09-01T08:39:48Z", stage:"won", amount:295 },
  { id:"519124356296", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Roisin Sheridan", createdate:"2026-09-01T09:24:07Z", stage:"app", amount:440 },
  { id:"519167451351", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Laura Dwyer", createdate:"2026-09-01T09:34:24Z", stage:"app", amount:440 },
  { id:"519086021854", dealname:"Supervisory Management - Online Anytime 1:1 (6N4329 OA DBU) -  for Niamh Byrne", createdate:"2026-09-01T09:45:08Z", stage:"won", amount:380 },
  { id:"519219515582", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aodhdin Twomey", createdate:"2026-09-01T10:06:53Z", stage:"won", amount:440 },
  { id:"519217846517", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Olivia Hunt", createdate:"2026-09-01T10:48:08Z", stage:"app", amount:440 },
  { id:"519217881304", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Martina Cerrotta", createdate:"2026-09-01T11:19:30Z", stage:"app", amount:440 },
  { id:"519128158455", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Gilmartin Sarah", createdate:"2026-09-01T11:31:57Z", stage:"won", amount:440 },
  { id:"519164168397", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Eileen Rowland", createdate:"2026-09-01T12:28:31Z", stage:"app", amount:295 },
  { id:"519133316308", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Samantha Sykes", createdate:"2026-09-01T12:37:44Z", stage:"won", amount:440 },
  { id:"519093552360", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for JENNIFER MURRAY", createdate:"2026-09-01T16:13:13Z", stage:"app", amount:295 },
  { id:"519126462702", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Catherine Briody", createdate:"2026-09-01T17:46:03Z", stage:"won", amount:440 },
  { id:"519089915125", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Gemma Gooney", createdate:"2026-09-01T17:49:51Z", stage:"won", amount:440 },
  { id:"519288336624", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Hollie Reville", createdate:"2026-09-01T17:50:48Z", stage:"app", amount:295 },
  { id:"519216510177", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Anthony Kelly", createdate:"2026-09-01T18:02:47Z", stage:"app", amount:440 },
  { id:"519249097951", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Drogheda for Gillian Clarkin", createdate:"2026-09-01T19:02:39Z", stage:"app", amount:440 },
  { id:"519168176329", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Samantha Sullivan", createdate:"2026-09-01T19:51:49Z", stage:"app", amount:440 },
  { id:"519271965916", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Drogheda for Gillian Clarkin", createdate:"2026-09-01T19:54:26Z", stage:"won", amount:440 },
  { id:"519291112658", dealname:"Applied Behavioural Analysis - Online Anytime 1:1 (5N1729 OA DSC) -  for Laura Weston Ruddy", createdate:"2026-09-01T20:53:16Z", stage:"won", amount:425 },
  { id:"519288948962", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Enya Orourke", createdate:"2026-09-01T22:30:27Z", stage:"app", amount:440 },
  { id:"519288952013", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Joseph Ganley", createdate:"2026-09-01T22:36:57Z", stage:"won", amount:295 },
  { id:"519311815918", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Allexia Roca", createdate:"2026-09-02T08:34:33Z", stage:"app", amount:440 },
  { id:"519317122284", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Allexia Roca", createdate:"2026-09-02T08:37:09Z", stage:"won", amount:440 },
  { id:"519318035678", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Lisa Wyles", createdate:"2026-09-02T09:38:25Z", stage:"won", amount:440 },
  { id:"519335328992", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Talita Cristina Pinheiro", createdate:"2026-09-02T10:11:28Z", stage:"app", amount:295 },
  { id:"519336692949", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Josephine Carolan", createdate:"2026-09-02T10:42:07Z", stage:"won", amount:455 },
  { id:"519336607969", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Sethu Makapela", createdate:"2026-09-02T10:49:11Z", stage:"app", amount:0 },
  { id:"519345835222", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Sadie Naidoo", createdate:"2026-09-02T11:15:02Z", stage:"app", amount:440 },
  { id:"519339313368", dealname:"Cleanpass (Level 3) - Classroom Near You (3N0574 CNY DCP) - Mullingar for  ", createdate:"2026-09-02T12:56:31Z", stage:"app", amount:0 },
  { id:"519351626999", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Tony Cummins", createdate:"2026-09-02T13:25:48Z", stage:"app", amount:295 },
  { id:"519351492841", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for John Cummins", createdate:"2026-09-02T13:29:36Z", stage:"app", amount:295 },
  { id:"519453711554", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for John Anthony Cummins", createdate:"2026-09-02T14:29:43Z", stage:"app", amount:295 },
  { id:"519419357394", dealname:"Cleanpass (Level 3) - Classroom Near You (3N0574 CNY DCP) - Mullingar for  ", createdate:"2026-09-02T15:51:46Z", stage:"app", amount:0 },
  { id:"519485806789", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Caoímhe Bond", createdate:"2026-09-02T15:59:12Z", stage:"app", amount:440 },
  { id:"519470162111", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for sandra barry", createdate:"2026-09-02T17:03:19Z", stage:"won", amount:295 },
  { id:"519403287784", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Lynagh Lynagh", createdate:"2026-09-02T17:22:25Z", stage:"won", amount:440 },
  { id:"519512782056", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Catherine Cheung", createdate:"2026-09-02T18:45:10Z", stage:"app", amount:440 },
  { id:"519479203040", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ashbourne for Denise Gough", createdate:"2026-09-02T19:39:17Z", stage:"app", amount:440 },
  { id:"519528911067", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for John Masterson", createdate:"2026-09-02T20:25:23Z", stage:"app", amount:440 },
  { id:"519440215255", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Ruth bowler", createdate:"2026-09-02T20:27:27Z", stage:"app", amount:440 },
  { id:"519527208141", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Eileen Rowland", createdate:"2026-09-02T21:49:38Z", stage:"won", amount:295 },
  { id:"519465205982", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Caroline McCabe Traynor", createdate:"2026-09-03T00:00:12Z", stage:"app", amount:440 },
  { id:"519499093204", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Atlanta Lynch Lonican", createdate:"2026-09-03T07:32:02Z", stage:"won", amount:170 },
  { id:"519420249324", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for  ", createdate:"2026-09-03T08:31:56Z", stage:"app", amount:440 },
  { id:"519509742789", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Theresa Kiely", createdate:"2026-09-03T10:41:33Z", stage:"won", amount:295 },
  { id:"519405898976", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Yvonne Rountree", createdate:"2026-09-03T11:26:30Z", stage:"won", amount:295 },
  { id:"519384358106", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Rosy Holman", createdate:"2026-09-03T11:53:20Z", stage:"app", amount:440 },
  { id:"519467567346", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Martina McGreal", createdate:"2026-09-03T12:34:30Z", stage:"app", amount:440 },
  { id:"519506275517", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for pierce Mcgurk", createdate:"2026-09-03T13:43:10Z", stage:"app", amount:440 },
  { id:"519382567135", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Sinead Dunphy", createdate:"2026-09-03T14:26:57Z", stage:"app", amount:455 },
  { id:"519384632513", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Breda Rogers", createdate:"2026-09-03T16:30:34Z", stage:"app", amount:440 },
  { id:"519688084718", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Kate Mulvey McQuaid", createdate:"2026-09-03T18:40:22Z", stage:"app", amount:295 },
  { id:"519688084728", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Aisling Bhreathnach", createdate:"2026-09-03T18:40:45Z", stage:"won", amount:440 },
  { id:"519749592269", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Lucy Gallagher", createdate:"2026-09-03T19:46:19Z", stage:"app", amount:440 },
  { id:"519753266384", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Sinead Horgan", createdate:"2026-09-03T20:45:08Z", stage:"app", amount:440 },
  { id:"519730030802", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Caroline Conlon", createdate:"2026-09-03T21:03:19Z", stage:"app", amount:440 },
  { id:"519788408012", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Charlene Grogan", createdate:"2026-09-04T07:36:20Z", stage:"app", amount:440 },
  { id:"519829954803", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Graciele Maria Ludwig", createdate:"2026-09-04T09:42:43Z", stage:"won", amount:295 },
  { id:"519888096473", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Yvonne Guilfoyle", createdate:"2026-09-04T10:54:07Z", stage:"app", amount:440 },
  { id:"519878287581", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Alicia McInerney", createdate:"2026-09-04T11:59:25Z", stage:"app", amount:440 },
  { id:"519835534542", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Inga Venckute", createdate:"2026-09-04T12:00:06Z", stage:"won", amount:440 },
  { id:"519812140276", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Leanne Lynch", createdate:"2026-09-04T12:38:04Z", stage:"app", amount:440 },
  { id:"519835575499", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for  ", createdate:"2026-09-04T12:44:00Z", stage:"app", amount:440 },
  { id:"519913091291", dealname:"Business Administration Skills - Online Anytime 1:1 (5N1610 OA DBU) -  for Mary Kelly", createdate:"2026-09-04T12:51:35Z", stage:"app", amount:295 },
  { id:"519878385868", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Leann Wallace", createdate:"2026-09-04T13:33:36Z", stage:"app", amount:440 },
  { id:"519801442532", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Mary Kelly", createdate:"2026-09-04T14:02:27Z", stage:"app", amount:440 },
  { id:"519878498528", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Nicola O Higgins", createdate:"2026-09-04T14:55:27Z", stage:"app", amount:455 },
  { id:"519826685135", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Erin Murray", createdate:"2026-09-04T16:02:44Z", stage:"app", amount:295 },
  { id:"519824945371", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for SAMANTHA KANE", createdate:"2026-09-04T16:24:29Z", stage:"won", amount:440 },
  { id:"519782862073", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Aine Mc Loughlin", createdate:"2026-09-04T18:41:01Z", stage:"app", amount:440 },
  { id:"519835890887", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for María Cristina Martín Martín", createdate:"2026-09-04T19:28:15Z", stage:"app", amount:455 },
  { id:"519775692992", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Katriona Smyth", createdate:"2026-09-04T19:42:42Z", stage:"app", amount:440 },
  { id:"519789084890", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for  ", createdate:"2026-09-04T20:40:06Z", stage:"app", amount:440 },
  { id:"519904102607", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Grainne Martin", createdate:"2026-09-04T20:43:40Z", stage:"won", amount:440 },
  { id:"519871519974", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for madison diver", createdate:"2026-09-04T21:04:06Z", stage:"won", amount:440 },
  { id:"519868024051", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Emma Stapleton", createdate:"2026-09-04T21:14:05Z", stage:"app", amount:295 },
  { id:"519863432429", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Angela Fitzpatrick", createdate:"2026-09-04T21:25:06Z", stage:"app", amount:440 },
  { id:"519963669717", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Leah Baskin", createdate:"2026-09-04T22:49:53Z", stage:"won", amount:440 },
  { id:"520004676813", dealname:"Palliative Care Support - Online Anytime 1:1 (5N3769 OA DHC) -  for Joel Sono", createdate:"2026-09-05T00:26:43Z", stage:"app", amount:295 },
  { id:"519997575412", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Angelica Marini", createdate:"2026-09-05T04:35:06Z", stage:"app", amount:295 },
  { id:"519969249510", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Caroline Ryan", createdate:"2026-09-05T05:21:37Z", stage:"app", amount:440 },
  { id:"519954953460", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Carmen Cash", createdate:"2026-09-05T07:33:13Z", stage:"won", amount:170 },
  { id:"520003133641", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Andrew Swanick", createdate:"2026-09-05T09:14:20Z", stage:"app", amount:440 },
  { id:"519942681805", dealname:"Cleanpass (Level 3) - Classroom Near You (3N0574 CNY DCP) - Mullingar for  ", createdate:"2026-09-05T16:35:09Z", stage:"app", amount:0 },
  { id:"519957032156", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for yvonne Guilfoyle", createdate:"2026-09-05T18:01:47Z", stage:"won", amount:440 },
  { id:"519964372189", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mallow for Maria Mccarthy", createdate:"2026-09-05T18:52:50Z", stage:"app", amount:440 },
  { id:"520029556939", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Pauline Dennehy", createdate:"2026-09-05T20:03:41Z", stage:"app", amount:440 },
  { id:"519946411220", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Annmarie Taylor", createdate:"2026-09-05T20:31:50Z", stage:"app", amount:440 },
  { id:"519908832463", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Susan Mooney", createdate:"2026-09-06T08:39:35Z", stage:"won", amount:295 },
  { id:"519959532734", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Pauline Dennehy", createdate:"2026-09-06T10:36:15Z", stage:"app", amount:440 },
  { id:"519941513443", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Caoímhe Bond", createdate:"2026-09-06T13:08:01Z", stage:"won", amount:440 },
  { id:"519939825878", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Hazel McCormack", createdate:"2026-09-06T17:23:40Z", stage:"app", amount:440 },
  { id:"519926969558", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ava McMahon", createdate:"2026-09-06T17:34:06Z", stage:"app", amount:440 },
  { id:"520104261876", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Sinead Hourihane", createdate:"2026-09-06T17:37:07Z", stage:"won", amount:440 },
  { id:"520008756443", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Alysha Murphy", createdate:"2026-09-06T19:00:17Z", stage:"won", amount:440 },
  { id:"520097732830", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Ethna Killeen", createdate:"2026-09-06T19:08:46Z", stage:"won", amount:440 },
  { id:"520014058735", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Philip Doherty", createdate:"2026-09-06T19:18:26Z", stage:"app", amount:440 },
  { id:"519952418025", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Aideen Farrelly", createdate:"2026-09-06T19:30:00Z", stage:"app", amount:440 },
  { id:"520002407629", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Michelle Dolan", createdate:"2026-09-06T19:43:00Z", stage:"won", amount:440 },
  { id:"520097795317", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Aine McRory", createdate:"2026-09-06T20:33:18Z", stage:"app", amount:440 },
  { id:"519966953676", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Aileen Hanley", createdate:"2026-09-06T21:25:09Z", stage:"won", amount:440 },
  { id:"520030317803", dealname:"Payroll Manual and Computerised - Online Anytime 1:1 (5N1546 OA DBU) -  for Aishling Murray", createdate:"2026-09-06T22:43:58Z", stage:"app", amount:395 },
  { id:"520159274199", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for +353879910836 Aircall new contact", createdate:"2026-09-07T09:18:17Z", stage:"app", amount:440 },
  { id:"520159599834", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Paula McCarthy", createdate:"2026-09-07T09:20:11Z", stage:"won", amount:440 },
  { id:"520159699146", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Mary Clifford", createdate:"2026-09-07T09:33:59Z", stage:"app", amount:440 },
  { id:"520167133400", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Sarah Mackin", createdate:"2026-09-07T09:53:11Z", stage:"app", amount:440 },
  { id:"520171982072", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Jessica Davis", createdate:"2026-09-07T11:23:18Z", stage:"app", amount:440 },
  { id:"520169925818", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Lorraine Lozano", createdate:"2026-09-07T11:28:59Z", stage:"won", amount:440 },
  { id:"520172148978", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Fiona Paterson", createdate:"2026-09-07T11:39:23Z", stage:"app", amount:295 },
  { id:"520172771569", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Bernadette Mahon", createdate:"2026-09-07T12:20:53Z", stage:"won", amount:295 },
  { id:"520235975914", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Megan Ryan", createdate:"2026-09-07T14:37:28Z", stage:"app", amount:440 },
  { id:"520219804906", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Chloe Ellard", createdate:"2026-09-07T14:59:01Z", stage:"app", amount:440 },
  { id:"520302595287", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Keri Melia", createdate:"2026-09-07T15:59:10Z", stage:"app", amount:295 },
  { id:"520221726929", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Philip Doherty", createdate:"2026-09-07T17:25:41Z", stage:"won", amount:440 },
  { id:"520316985564", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Grainne Deery", createdate:"2026-09-07T17:48:54Z", stage:"app", amount:440 },
  { id:"520250591473", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Sarah Walsh", createdate:"2026-09-07T17:53:41Z", stage:"app", amount:295 },
  { id:"520278662387", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Ann Fennelly", createdate:"2026-09-07T18:18:14Z", stage:"app", amount:440 },
  { id:"520380763342", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sue Ward", createdate:"2026-09-07T19:13:10Z", stage:"app", amount:440 },
  { id:"520331276489", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sue Ward", createdate:"2026-09-07T19:20:14Z", stage:"won", amount:440 },
  { id:"520327718134", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Katie Tunney", createdate:"2026-09-07T20:33:51Z", stage:"app", amount:440 },
  { id:"520380804316", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Katie Tunney", createdate:"2026-09-07T20:49:26Z", stage:"won", amount:440 },
  { id:"520331350245", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Marilyn Fox", createdate:"2026-09-07T22:08:45Z", stage:"app", amount:440 },
  { id:"520387347692", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Brenda Tuite", createdate:"2026-09-07T22:57:12Z", stage:"app", amount:0 },
  { id:"520363563223", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Sinead Lynch", createdate:"2026-09-08T10:38:33Z", stage:"app", amount:0 },
  { id:"520344533225", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Denise Walsh O'Gorman", createdate:"2026-09-08T12:09:50Z", stage:"app", amount:440 },
  { id:"520404034761", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Conor Doheny", createdate:"2026-09-08T12:25:32Z", stage:"app", amount:295 },
  { id:"520404067536", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Claudia Burton", createdate:"2026-09-08T12:59:48Z", stage:"app", amount:295 },
  { id:"520547240147", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Chloe Greally", createdate:"2026-09-08T14:50:09Z", stage:"app", amount:440 },
  { id:"520451441853", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Stephanie Fitzgerald", createdate:"2026-09-08T14:55:19Z", stage:"app", amount:440 },
  { id:"520547264723", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Surendra Singh", createdate:"2026-09-08T15:11:10Z", stage:"won", amount:295 },
  { id:"520554446013", dealname:"Human Resources Management - Online Anytime 1:1 (6N3750 OA DBU) -  for Lauren Kelly", createdate:"2026-09-08T15:27:09Z", stage:"app", amount:380 },
  { id:"520545565893", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Yvonne O'Driscoll", createdate:"2026-09-08T18:07:26Z", stage:"won", amount:440 },
  { id:"520469572806", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sarah Duffy Carruthers", createdate:"2026-09-08T18:18:39Z", stage:"app", amount:440 },
  { id:"520449773782", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Majella Campbell", createdate:"2026-09-08T18:34:39Z", stage:"app", amount:440 },
  { id:"520560039123", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Louise Mc callion", createdate:"2026-09-08T20:01:59Z", stage:"won", amount:440 },
  { id:"520586895574", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Hazel Nolan", createdate:"2026-09-08T21:51:29Z", stage:"app", amount:440 },
  { id:"520635627706", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Sean O'Reilly", createdate:"2026-09-08T22:51:44Z", stage:"won", amount:440 },
  { id:"520633833705", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Asma Abdullahi Ali", createdate:"2026-09-08T22:57:21Z", stage:"app", amount:295 },
  { id:"520651923682", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Olive Mc Marlow", createdate:"2026-09-09T02:10:30Z", stage:"app", amount:440 },
  { id:"520687287536", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Tanya McDonnell", createdate:"2026-09-09T02:53:41Z", stage:"app", amount:440 },
  { id:"520601815231", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Saoirse O Dwyer", createdate:"2026-09-09T08:20:25Z", stage:"app", amount:440 },
  { id:"520696814796", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Fiona Doherty", createdate:"2026-09-09T08:41:27Z", stage:"app", amount:440 },
  { id:"520632420559", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Edel Gilmartin", createdate:"2026-09-09T09:15:43Z", stage:"app", amount:440 },
  { id:"520650470617", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Edel Baxter", createdate:"2026-09-09T09:21:10Z", stage:"won", amount:440 },
  { id:"520693271751", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Jacqui Lythgoe", createdate:"2026-09-09T09:32:13Z", stage:"app", amount:440 },
  { id:"520641578212", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Caroline Channing", createdate:"2026-09-09T10:18:07Z", stage:"won", amount:295 },
  { id:"520689750207", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Claudia Burton", createdate:"2026-09-09T10:20:52Z", stage:"won", amount:295 },
  { id:"520640008415", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Seanan Brennan", createdate:"2026-09-09T10:26:21Z", stage:"app", amount:295 },
  { id:"520591115460", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Fiona Doherty", createdate:"2026-09-09T10:32:28Z", stage:"won", amount:440 },
  { id:"520614470899", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Karen Gilbride", createdate:"2026-09-09T10:42:45Z", stage:"app", amount:440 },
  { id:"520658336954", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Caroline Navin", createdate:"2026-09-09T11:36:17Z", stage:"app", amount:440 },
  { id:"520636533995", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Casey Harvey", createdate:"2026-09-09T12:42:29Z", stage:"won", amount:295 },
  { id:"520613198055", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Merinda Ryan Doyle", createdate:"2026-09-09T13:29:38Z", stage:"won", amount:440 },
  { id:"520891492562", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Lauren Maloney", createdate:"2026-09-09T14:06:16Z", stage:"app", amount:440 },
  { id:"520841877707", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Orla Maloney", createdate:"2026-09-09T14:12:40Z", stage:"won", amount:440 },
  { id:"520840230119", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Saoirse O Dwyer", createdate:"2026-09-09T14:48:42Z", stage:"won", amount:440 },
  { id:"520870942910", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Stephanie Noone", createdate:"2026-09-09T16:06:13Z", stage:"app", amount:295 },
  { id:"520897070304", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Jamie-Leigh Powell", createdate:"2026-09-09T17:25:45Z", stage:"won", amount:295 },
  { id:"520838647000", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for lisa mcgovern", createdate:"2026-09-09T18:12:28Z", stage:"app", amount:440 },
  { id:"520824293607", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Eileen Mckinney", createdate:"2026-09-09T18:51:33Z", stage:"app", amount:440 },
  { id:"520843965631", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Kyeira Mckevitt", createdate:"2026-09-09T19:09:56Z", stage:"won", amount:440 },
  { id:"520876414178", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ellie Healy", createdate:"2026-09-09T19:24:14Z", stage:"app", amount:440 },
  { id:"520851106020", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Elaine Cremin", createdate:"2026-09-09T20:04:45Z", stage:"won", amount:440 },
  { id:"520799290607", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mallow for Michelle Cotter", createdate:"2026-09-09T20:10:30Z", stage:"app", amount:440 },
  { id:"520786696403", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Catherine Murphy", createdate:"2026-09-09T20:28:05Z", stage:"app", amount:440 },
  { id:"520822684883", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Chloe Smith", createdate:"2026-09-09T20:40:21Z", stage:"app", amount:440 },
  { id:"520874746072", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Saoirse Kelly", createdate:"2026-09-09T20:44:45Z", stage:"app", amount:440 },
  { id:"520802874563", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mallow for Michelle Cotter", createdate:"2026-09-09T21:35:14Z", stage:"won", amount:440 },
  { id:"520867602634", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Conor Doheny", createdate:"2026-09-09T21:42:01Z", stage:"app", amount:440 },
  { id:"520826422481", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Ryan Roe", createdate:"2026-09-09T23:24:53Z", stage:"app", amount:440 },
  { id:"520808585449", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Syeda Saiqa Zeeshan", createdate:"2026-09-10T04:47:18Z", stage:"app", amount:440 },
  { id:"520892284144", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Anthony Kelly", createdate:"2026-09-10T07:30:40Z", stage:"won", amount:440 },
  { id:"520929255660", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Carol Matthews", createdate:"2026-09-10T10:42:31Z", stage:"app", amount:440 },
  { id:"520787628223", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Molly Diviney", createdate:"2026-09-10T11:45:23Z", stage:"app", amount:440 },
  { id:"520836005068", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Ryan Hayes", createdate:"2026-09-10T12:26:53Z", stage:"app", amount:440 },
  { id:"520839650499", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Louise Buckley", createdate:"2026-09-10T12:38:23Z", stage:"app", amount:440 },
  { id:"520899623107", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Marie Conroy", createdate:"2026-09-10T13:55:05Z", stage:"won", amount:455 },
  { id:"520800337099", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Amelia Boyle", createdate:"2026-09-10T14:03:02Z", stage:"app", amount:440 },
  { id:"520841627866", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Saoirse Egan", createdate:"2026-09-10T14:07:08Z", stage:"app", amount:440 },
  { id:"520855974076", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Sheila Palmer", createdate:"2026-09-10T15:11:06Z", stage:"won", amount:440 },
  { id:"520901652689", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Majella O Hagan", createdate:"2026-09-10T16:57:58Z", stage:"app", amount:440 },
  { id:"520850602202", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Hannah Keogh", createdate:"2026-09-10T18:17:10Z", stage:"won", amount:440 },
  { id:"520872428733", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Karen Mccolgan", createdate:"2026-09-10T18:21:06Z", stage:"app", amount:440 },
  { id:"520990508256", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Karen Mccolgan", createdate:"2026-09-10T18:25:07Z", stage:"won", amount:440 },
  { id:"520885898478", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Alanna OReilly", createdate:"2026-09-10T18:36:31Z", stage:"app", amount:440 },
  { id:"520786146540", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Molly Diviney", createdate:"2026-09-10T19:19:26Z", stage:"won", amount:440 },
  { id:"520856234232", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Lauren Clynch", createdate:"2026-09-10T19:28:24Z", stage:"app", amount:440 },
  { id:"520983489763", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Ralph manda", createdate:"2026-09-10T19:44:13Z", stage:"app", amount:295 },
  { id:"520872566986", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Martina Maguire", createdate:"2026-09-10T21:02:01Z", stage:"app", amount:440 },
  { id:"520834708706", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Collette McCormack", createdate:"2026-09-10T21:17:59Z", stage:"app", amount:440 },
  { id:"520838315257", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Oluwatayo Kalejaiye", createdate:"2026-09-10T21:26:05Z", stage:"app", amount:440 },
  { id:"520962360554", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Louise Kiernan", createdate:"2026-09-10T21:53:54Z", stage:"app", amount:0 },
  { id:"520930218228", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Sarah Flanagan", createdate:"2026-09-11T00:15:05Z", stage:"app", amount:455 },
  { id:"520987044078", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Sarah Flanagan", createdate:"2026-09-11T00:18:08Z", stage:"won", amount:455 },
  { id:"521003496657", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Karen Roddy", createdate:"2026-09-11T06:06:16Z", stage:"app", amount:440 },
  { id:"520967933156", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Leeanne Fitzpatrick", createdate:"2026-09-11T09:44:55Z", stage:"app", amount:440 },
  { id:"521029236930", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Aoife Leahy", createdate:"2026-09-11T09:52:51Z", stage:"app", amount:295 },
  { id:"520989509862", dealname:"Nursing Theory and Practice - Online Anytime 1:1 (5N4325 OA DHC) -  for Lenhle Nompumelelo Dlamini Dlamini", createdate:"2026-09-11T10:21:06Z", stage:"app", amount:295 },
  { id:"521032735968", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Jessica Davis", createdate:"2026-09-11T11:57:35Z", stage:"won", amount:440 },
  { id:"521039686873", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Catherine Mason", createdate:"2026-09-11T13:08:38Z", stage:"app", amount:440 },
  { id:"521046521052", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Eamon Willis", createdate:"2026-09-11T15:13:20Z", stage:"app", amount:440 },
  { id:"521159679190", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Chelsea Doyle", createdate:"2026-09-11T16:17:48Z", stage:"won", amount:440 },
  { id:"521179776230", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Paula Healy", createdate:"2026-09-11T20:16:33Z", stage:"app", amount:440 },
  { id:"521244405979", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Vivian Juffs", createdate:"2026-09-11T22:50:58Z", stage:"app", amount:440 },
  { id:"521298438358", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Natasha O' Toole", createdate:"2026-09-11T23:12:52Z", stage:"app", amount:440 },
  { id:"521320118509", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Natasha O' Toole", createdate:"2026-09-11T23:18:57Z", stage:"app", amount:440 },
  { id:"521284195544", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Stephanie Fahey", createdate:"2026-09-12T00:35:56Z", stage:"app", amount:440 },
  { id:"521291771087", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Brid Ryan", createdate:"2026-09-12T06:38:34Z", stage:"app", amount:440 },
  { id:"521273649338", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for  ", createdate:"2026-09-12T08:23:51Z", stage:"won", amount:455 },
  { id:"521290192064", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Deirdre Fenlon", createdate:"2026-09-12T11:52:04Z", stage:"app", amount:440 },
  { id:"521407904970", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Pamela Kavanagh", createdate:"2026-09-12T17:52:43Z", stage:"app", amount:440 },
  { id:"521321270489", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Breffni Gormley", createdate:"2026-09-12T17:59:56Z", stage:"app", amount:440 },
  { id:"521270868170", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ilku Aniko", createdate:"2026-09-12T19:07:51Z", stage:"won", amount:440 },
  { id:"521417682112", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Justyna Wargala", createdate:"2026-09-13T08:27:39Z", stage:"app", amount:440 },
  { id:"521460694250", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Helena Maye", createdate:"2026-09-13T09:00:04Z", stage:"app", amount:440 },
  { id:"521396646114", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Pamela Kavanagh", createdate:"2026-09-13T11:18:16Z", stage:"won", amount:440 },
  { id:"521471904979", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Nocola O Higgins", createdate:"2026-09-13T12:33:28Z", stage:"won", amount:440 },
  { id:"521477212406", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Chloe Kavanagh", createdate:"2026-09-13T14:09:01Z", stage:"app", amount:440 },
  { id:"521433338067", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Emer O Farrell", createdate:"2026-09-13T16:22:54Z", stage:"app", amount:440 },
  { id:"521479559365", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Kim Murdock", createdate:"2026-09-13T16:37:44Z", stage:"won", amount:440 },
  { id:"521480188114", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Rebecca Dwyer", createdate:"2026-09-13T17:15:32Z", stage:"won", amount:440 },
  { id:"521434988760", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for James Rutledge", createdate:"2026-09-13T18:29:53Z", stage:"app", amount:295 },
  { id:"521434988760", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for James Rutledge", createdate:"2026-09-13T18:29:53Z", stage:"app", amount:295 },
  { id:"521436184773", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Mihaela Tiganescu", createdate:"2026-09-13T20:12:26Z", stage:"app", amount:440 },
  { id:"521436843198", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Emma hughes", createdate:"2026-09-13T20:42:16Z", stage:"app", amount:440 },
  { id:"521425202382", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Daniel McCann", createdate:"2026-09-13T21:28:23Z", stage:"app", amount:440 },
  { id:"521498795229", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Vida Lescinskiene", createdate:"2026-09-14T08:38:38Z", stage:"app", amount:0 },
  { id:"521423692002", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Ellie Costelloe", createdate:"2026-09-14T12:40:05Z", stage:"won", amount:440 },
  { id:"521523625169", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Kayleigh Griffin", createdate:"2026-09-14T13:00:09Z", stage:"app", amount:440 },
  { id:"521518928061", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Jennifer Fidgeon", createdate:"2026-09-14T13:09:50Z", stage:"app", amount:0 },
  { id:"521514202333", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Marie Noone", createdate:"2026-09-14T13:35:31Z", stage:"app", amount:440 },
  { id:"521521376473", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Kayleigh Griffin", createdate:"2026-09-14T13:40:03Z", stage:"won", amount:440 },
  { id:"521527525611", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Irene O'Sullivan", createdate:"2026-09-14T14:43:25Z", stage:"won", amount:440 },
  { id:"521536516339", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Chloe Duignan", createdate:"2026-09-14T16:35:16Z", stage:"won", amount:440 },
  { id:"521536523508", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Helena Coughlin", createdate:"2026-09-14T16:43:47Z", stage:"won", amount:440 },
  { id:"521537104117", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Emma Conneely", createdate:"2026-09-14T16:55:12Z", stage:"app", amount:0 },
  { id:"521519747315", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ivanna Proc", createdate:"2026-09-14T20:55:42Z", stage:"app", amount:440 },
  { id:"521575975157", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Isobéil Murphy", createdate:"2026-09-15T07:27:13Z", stage:"won", amount:170 },
  { id:"521576826045", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Siobhan Lynch", createdate:"2026-09-15T07:47:41Z", stage:"won", amount:440 },
  { id:"521577190621", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Sinead Archbold", createdate:"2026-09-15T08:20:23Z", stage:"won", amount:440 },
  { id:"521520271561", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Darragh McQuaid", createdate:"2026-09-15T08:39:15Z", stage:"app", amount:440 },
  { id:"521578186960", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Lydia Kelly", createdate:"2026-09-15T08:52:02Z", stage:"app", amount:440 },
  { id:"521584727235", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Collette Stephenson", createdate:"2026-09-15T09:55:25Z", stage:"app", amount:440 },
  { id:"521586597056", dealname:"Payroll Manual and Computerised - Online Anytime 1:1 (5N1546 OA DBU) -  for Rebecca Fitzgerald", createdate:"2026-09-15T10:05:05Z", stage:"app", amount:395 },
  { id:"521586893047", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Michelle O Connor", createdate:"2026-09-15T10:31:20Z", stage:"app", amount:440 },
  { id:"521587867853", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Amy Gaffney", createdate:"2026-09-15T11:16:18Z", stage:"app", amount:440 },
  { id:"521591534822", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ashbourne for Bhawna Kumar", createdate:"2026-09-15T11:33:27Z", stage:"app", amount:440 },
  { id:"521526099136", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Maria Teresa Merino", createdate:"2026-09-15T11:37:42Z", stage:"app", amount:440 },
  { id:"521589157078", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Ella Durkan", createdate:"2026-09-15T12:23:51Z", stage:"won", amount:455 },
  { id:"521580193014", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for xx Xxc", createdate:"2026-09-15T12:23:52Z", stage:"app", amount:440 },
  { id:"521589928151", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Michelle O Connor", createdate:"2026-09-15T12:49:12Z", stage:"app", amount:440 },
  { id:"521594259671", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Tina Morrissey", createdate:"2026-09-15T13:10:49Z", stage:"app", amount:440 },
  { id:"521595145408", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Zoe tate", createdate:"2026-09-15T13:31:38Z", stage:"app", amount:440 },
  { id:"521600466155", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Tricia Jones", createdate:"2026-09-15T14:49:53Z", stage:"app", amount:440 },
  { id:"521609025723", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Michelle Saluta", createdate:"2026-09-15T19:01:03Z", stage:"app", amount:440 },
  { id:"521612732659", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Kathrine English", createdate:"2026-09-15T20:00:55Z", stage:"app", amount:455 },
  { id:"521610611919", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Shona Poland", createdate:"2026-09-15T21:02:24Z", stage:"app", amount:440 },
  { id:"521620584645", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Niall Williams", createdate:"2026-09-15T21:58:01Z", stage:"won", amount:170 },
  { id:"521559516366", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Katie O Meara", createdate:"2026-09-15T23:08:09Z", stage:"app", amount:440 },
  { id:"521615972597", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Laura O'Neill", createdate:"2026-09-15T23:33:16Z", stage:"app", amount:440 },
  { id:"521648785643", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Caitriona Byrne", createdate:"2026-09-16T09:59:06Z", stage:"won", amount:440 },
  { id:"521654567119", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Eva Casey", createdate:"2026-09-16T10:25:58Z", stage:"app", amount:440 },
  { id:"521659359464", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for  ", createdate:"2026-09-16T11:53:33Z", stage:"app", amount:455 },
  { id:"521662632143", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Shane Lynch", createdate:"2026-09-16T12:45:39Z", stage:"app", amount:0 },
  { id:"521664247007", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Ciara Luby", createdate:"2026-09-16T13:18:26Z", stage:"app", amount:440 },
  { id:"521664617700", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Clodagh Tighe", createdate:"2026-09-16T13:23:47Z", stage:"won", amount:440 },
  { id:"521664936145", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Ciara Luby", createdate:"2026-09-16T13:29:10Z", stage:"won", amount:440 },
  { id:"521679800569", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Nikita Kennedy", createdate:"2026-09-16T14:16:46Z", stage:"won", amount:440 },
  { id:"521690180843", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for Kate Nwaka", createdate:"2026-09-16T14:43:36Z", stage:"won", amount:295 },
  { id:"521677239493", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Kirsty Murphy", createdate:"2026-09-16T15:22:58Z", stage:"won", amount:440 },
  { id:"521696207078", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Adnaan Mohamed Abdi", createdate:"2026-09-16T15:50:25Z", stage:"won", amount:295 },
  { id:"521696302310", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Ruth Cunningham", createdate:"2026-09-16T15:59:07Z", stage:"app", amount:295 },
  { id:"521657492717", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Shane Mc Devitt", createdate:"2026-09-16T17:00:56Z", stage:"won", amount:440 },
  { id:"521695187175", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Shona Poland", createdate:"2026-09-16T17:36:34Z", stage:"won", amount:440 },
  { id:"521751065840", dealname:"Rehabilitation Support - Online Anytime 1:1 (5N3775 OA DHC) -  for Akhil Chaudhary", createdate:"2026-09-16T17:53:34Z", stage:"app", amount:295 },
  { id:"521714677946", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Niamh O carroll", createdate:"2026-09-16T18:23:27Z", stage:"app", amount:440 },
  { id:"521754833119", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Mary Rose Kelleher", createdate:"2026-09-16T20:56:40Z", stage:"app", amount:295 },
  { id:"521763856595", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Kate Mulvey McQuaid", createdate:"2026-09-16T21:03:58Z", stage:"app", amount:295 },
  { id:"521760265426", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Michaela Russell", createdate:"2026-09-16T21:30:53Z", stage:"won", amount:440 },
  { id:"521795274942", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Jade Healy", createdate:"2026-09-16T21:49:13Z", stage:"app", amount:440 },
  { id:"521784384758", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Michelle O Connor", createdate:"2026-09-16T22:52:47Z", stage:"won", amount:440 },
  { id:"521737349361", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for samantha cadogan", createdate:"2026-09-17T09:33:16Z", stage:"app", amount:440 },
  { id:"521805203650", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Ali O riordan", createdate:"2026-09-17T09:35:48Z", stage:"won", amount:295 },
  { id:"521760848064", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Prashansh Dhakal", createdate:"2026-09-17T10:29:12Z", stage:"app", amount:440 },
  { id:"521755479243", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Aoife Mc Caffferty", createdate:"2026-09-17T10:41:46Z", stage:"app", amount:295 },
  { id:"521733954754", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Aoife Mc Caffferty", createdate:"2026-09-17T10:50:21Z", stage:"won", amount:295 },
  { id:"521768584422", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for Ali Mc grath", createdate:"2026-09-17T11:02:10Z", stage:"app", amount:440 },
  { id:"521816650953", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Marie Noone", createdate:"2026-09-17T12:55:47Z", stage:"app", amount:440 },
  { id:"521802413248", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Yvonne Johnson", createdate:"2026-09-17T14:38:53Z", stage:"won", amount:440 },
  { id:"521800006870", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Sharon Nallon", createdate:"2026-09-17T14:52:09Z", stage:"app", amount:0 },
  { id:"521723774170", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Murtagh O'Connor", createdate:"2026-09-17T16:49:22Z", stage:"won", amount:440 },
  { id:"521831085298", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Karen Hannigan", createdate:"2026-09-17T18:54:13Z", stage:"app", amount:440 },
  { id:"521821492435", dealname:"Challenging Behaviour - Online Anytime 1:1 (5N1706 OA DSC) -  for Glendon Anderson", createdate:"2026-09-17T19:22:13Z", stage:"app", amount:380 },
  { id:"521821504707", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Joseph King", createdate:"2026-09-17T19:40:54Z", stage:"app", amount:440 },
  { id:"521836445927", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Noelle Donnelly", createdate:"2026-09-17T19:44:55Z", stage:"won", amount:440 },
  { id:"521836486877", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Trudy Walsh", createdate:"2026-09-17T20:28:15Z", stage:"won", amount:440 },
  { id:"521842150625", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lisa Breeze", createdate:"2026-09-17T20:57:59Z", stage:"app", amount:440 },
  { id:"521879845063", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Ciara Nolan", createdate:"2026-09-17T21:14:42Z", stage:"app", amount:295 },
  { id:"521893420237", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Mary Byrne", createdate:"2026-09-18T07:13:21Z", stage:"app", amount:440 },
  { id:"521909559505", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Margaret Riney", createdate:"2026-09-18T07:18:20Z", stage:"won", amount:440 },
  { id:"521913023679", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Eithna Mealia", createdate:"2026-09-18T07:20:14Z", stage:"app", amount:0 },
  { id:"521878921426", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Geraldine Casey", createdate:"2026-09-18T08:15:05Z", stage:"app", amount:440 },
  { id:"521893582014", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Michelle Quirke", createdate:"2026-09-18T09:45:02Z", stage:"app", amount:440 },
  { id:"521930306783", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Mary Clifford", createdate:"2026-09-18T11:29:43Z", stage:"app", amount:440 },
  { id:"521943179488", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Noeleen Byrne", createdate:"2026-09-18T13:28:43Z", stage:"app", amount:440 },
  { id:"521938064605", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Erin Cassidy", createdate:"2026-09-18T13:42:39Z", stage:"app", amount:440 },
  { id:"521938185452", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Erin Cassidy", createdate:"2026-09-18T13:47:56Z", stage:"won", amount:440 },
  { id:"521943398638", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for Martina O Shea", createdate:"2026-09-18T13:51:35Z", stage:"app", amount:440 },
  { id:"521867064513", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Susan Douglas", createdate:"2026-09-18T14:51:56Z", stage:"app", amount:440 },
  { id:"521951009002", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Celina Heslin", createdate:"2026-09-18T17:42:38Z", stage:"app", amount:0 },
  { id:"521950545130", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Blessing Ngozi George-Gbagi", createdate:"2026-09-18T18:04:11Z", stage:"app", amount:440 },
  { id:"521903700212", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Dympna Harvey", createdate:"2026-09-18T18:18:21Z", stage:"won", amount:440 },
  { id:"521960181990", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Sinead O Reilly", createdate:"2026-09-18T19:38:00Z", stage:"app", amount:440 },
  { id:"521961489634", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Eleanor Sabry Tabrizy", createdate:"2026-09-18T21:18:04Z", stage:"app", amount:440 },
  { id:"521873235193", dealname:"Digital Marketing - Online Anytime 1:1 (5N1364 OA DBU) -  for SHAWAN GOUVEIA", createdate:"2026-09-18T21:46:33Z", stage:"won", amount:295 },
  { id:"521969711311", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Danielle O Donnell", createdate:"2026-09-19T00:12:16Z", stage:"app", amount:295 },
  { id:"521965975780", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Danielle O Donnell", createdate:"2026-09-19T00:52:20Z", stage:"app", amount:455 },
  { id:"522030946525", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Radmyla Mytelska", createdate:"2026-09-19T12:19:20Z", stage:"won", amount:170 },
  { id:"522049485038", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Danielle Mc daid", createdate:"2026-09-19T13:24:48Z", stage:"app", amount:440 },
  { id:"522034479336", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Lorraine Kelly", createdate:"2026-09-19T14:03:14Z", stage:"app", amount:440 },
  { id:"521991893193", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Alison Dowling", createdate:"2026-09-19T15:24:16Z", stage:"app", amount:440 },
  { id:"522037950656", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Danielle Mc daid", createdate:"2026-09-19T17:16:23Z", stage:"app", amount:440 },
  { id:"522057576689", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for sarah o reilly", createdate:"2026-09-19T20:23:01Z", stage:"app", amount:440 },
  { id:"522035634425", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Noeleen Byrne", createdate:"2026-09-20T07:18:05Z", stage:"won", amount:440 },
  { id:"522120918235", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Clodagh Sheahan", createdate:"2026-09-20T14:18:58Z", stage:"won", amount:440 },
  { id:"522127234252", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Nobin Sabu", createdate:"2026-09-20T14:48:52Z", stage:"app", amount:295 },
  { id:"522139921611", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Nobin Sabu", createdate:"2026-09-20T19:47:47Z", stage:"won", amount:295 },
  { id:"522167200981", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Natasha Culhane", createdate:"2026-09-21T08:50:42Z", stage:"app", amount:295 },
  { id:"522194298089", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Tara Murray", createdate:"2026-09-21T09:57:16Z", stage:"app", amount:455 },
  { id:"522181351632", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Ciaran O Connell", createdate:"2026-09-21T10:31:12Z", stage:"app", amount:440 },
  { id:"522194167015", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Ciaran O Connell", createdate:"2026-09-21T10:35:21Z", stage:"won", amount:440 },
  { id:"522110791867", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Ciara Foy", createdate:"2026-09-21T11:11:27Z", stage:"app", amount:295 },
  { id:"522197021922", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Ciara Foy", createdate:"2026-09-21T11:21:17Z", stage:"won", amount:295 },
  { id:"522100012238", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aoife O' Gorman", createdate:"2026-09-21T11:26:21Z", stage:"won", amount:440 },
  { id:"522157212919", dealname:"Danielle", createdate:"2026-09-21T12:38:25Z", stage:"app", amount:0 },
  { id:"522198819047", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Tricia Jones", createdate:"2026-09-21T12:40:48Z", stage:"won", amount:440 },
  { id:"522191331553", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mallow for Kayleigh Collins", createdate:"2026-09-21T13:24:57Z", stage:"app", amount:440 },
  { id:"522161864898", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for sandra loughlin", createdate:"2026-09-21T16:29:30Z", stage:"app", amount:440 },
  { id:"522217363677", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for sandra loughlin", createdate:"2026-09-21T16:32:18Z", stage:"won", amount:440 },
  { id:"522215227621", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Amy Gahan", createdate:"2026-09-21T17:29:48Z", stage:"app", amount:440 },
  { id:"522166115541", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Nessa Hart", createdate:"2026-09-21T18:47:16Z", stage:"app", amount:295 },
  { id:"522186438878", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Anab hassan Ibrahim", createdate:"2026-09-21T19:01:54Z", stage:"app", amount:295 },
  { id:"522330765540", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Majella Ohagan", createdate:"2026-09-21T22:02:08Z", stage:"app", amount:440 },
  { id:"522267698391", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sheila Cordonnier", createdate:"2026-09-21T22:03:10Z", stage:"won", amount:440 },
  { id:"522336548057", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Amy Gahan", createdate:"2026-09-22T06:17:29Z", stage:"won", amount:440 },
  { id:"522350850237", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Adam Carey", createdate:"2026-09-22T10:18:59Z", stage:"app", amount:440 },
  { id:"522282781900", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Brenda Leahy", createdate:"2026-09-22T10:37:02Z", stage:"app", amount:440 },
  { id:"522273990896", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Nicole Myles", createdate:"2026-09-22T13:51:15Z", stage:"app", amount:440 },
  { id:"522265086177", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Angela Pocius", createdate:"2026-09-22T14:38:40Z", stage:"app", amount:440 },
  { id:"522353015004", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Myself and Married", createdate:"2026-09-22T18:03:48Z", stage:"app", amount:440 },
  { id:"522263748823", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Evelyn Culhane", createdate:"2026-09-22T18:10:09Z", stage:"app", amount:440 },
  { id:"522272493766", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Izabela Bilinska", createdate:"2026-09-22T18:11:07Z", stage:"app", amount:440 },
  { id:"522367418595", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for Shaúna O'Halloran", createdate:"2026-09-22T19:56:20Z", stage:"app", amount:440 },
  { id:"522381475034", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Orla Mc glynn", createdate:"2026-09-22T19:58:42Z", stage:"app", amount:440 },
  { id:"522326679763", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aoife Mcfadden", createdate:"2026-09-22T21:26:39Z", stage:"app", amount:440 },
  { id:"522317776080", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for Rachel Walsh", createdate:"2026-09-22T22:22:51Z", stage:"app", amount:440 },
  { id:"522254932157", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Danielle Kerr", createdate:"2026-09-22T22:27:28Z", stage:"won", amount:440 },
  { id:"522457475290", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mallow for Ava Crowley", createdate:"2026-09-23T09:12:01Z", stage:"app", amount:440 },
  { id:"522405237969", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mallow for Ava Crowley", createdate:"2026-09-23T09:14:20Z", stage:"app", amount:440 },
  { id:"522480923881", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Emma Kehoe", createdate:"2026-09-23T09:46:52Z", stage:"won", amount:440 },
  { id:"522421894389", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Collette Mc Closkey", createdate:"2026-09-23T11:10:35Z", stage:"app", amount:440 },
  { id:"522526030012", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Michelle Mc donnell", createdate:"2026-09-23T13:22:30Z", stage:"won", amount:440 },
  { id:"522530983153", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Amanda Mc cafferty", createdate:"2026-09-23T13:36:11Z", stage:"app", amount:440 },
  { id:"522535677174", dealname:"Retail Selling - Online Anytime 1:1 (5N1619 OA DBU) -  for Melissa Hogan", createdate:"2026-09-23T13:56:44Z", stage:"app", amount:295 },
  { id:"522606231791", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Danielle Kelly", createdate:"2026-09-23T14:28:13Z", stage:"app", amount:440 },
  { id:"522569965790", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Fredy Melendez", createdate:"2026-09-23T16:09:11Z", stage:"app", amount:295 },
  { id:"522653784311", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Lauren Ward", createdate:"2026-09-23T19:52:56Z", stage:"app", amount:440 },
  { id:"522568581346", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Lauren Ward", createdate:"2026-09-23T19:56:43Z", stage:"app", amount:440 },
  { id:"522544072895", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Jenny kehoe", createdate:"2026-09-23T22:38:17Z", stage:"won", amount:440 },
  { id:"522546201839", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ayah Alswalmah", createdate:"2026-09-24T04:36:25Z", stage:"app", amount:440 },
  { id:"522770025696", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Ellen Parr💗", createdate:"2026-09-24T04:41:27Z", stage:"app", amount:295 },
  { id:"522645172422", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for Mary Madden", createdate:"2026-09-24T06:50:38Z", stage:"won", amount:295 },
  { id:"522605892812", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Barbara Gunn", createdate:"2026-09-24T07:33:20Z", stage:"app", amount:440 },
  { id:"522594788538", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Michaela Pace", createdate:"2026-09-24T08:09:15Z", stage:"app", amount:440 },
  { id:"522754057407", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Eileen Gregan", createdate:"2026-09-24T08:31:47Z", stage:"app", amount:440 },
  { id:"522578708671", dealname:"Business Management - Online Anytime 1:1 (6N4310 OA DBU) -  for Helio Cavalcanti", createdate:"2026-09-24T09:47:28Z", stage:"app", amount:380 },
  { id:"522775384257", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Michaela Pace", createdate:"2026-09-24T10:39:21Z", stage:"won", amount:440 },
  { id:"522759362753", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Amy💗 Bell", createdate:"2026-09-24T12:13:19Z", stage:"app", amount:440 },
  { id:"522819070164", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Eva Casey", createdate:"2026-09-24T12:15:33Z", stage:"won", amount:440 },
  { id:"522795769064", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Eileen Gregan", createdate:"2026-09-24T12:32:13Z", stage:"won", amount:440 },
  { id:"522795773168", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Holly Okeeffe", createdate:"2026-09-24T12:38:43Z", stage:"won", amount:440 },
  { id:"522847390955", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Angela Gillespie", createdate:"2026-09-24T14:29:13Z", stage:"app", amount:440 },
  { id:"522842451144", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Angela Gillespie", createdate:"2026-09-24T14:31:51Z", stage:"won", amount:440 },
  { id:"522846141641", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Sean Feeny", createdate:"2026-09-24T14:31:59Z", stage:"won", amount:440 },
  { id:"522871151812", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Katie OConnor", createdate:"2026-09-24T15:52:26Z", stage:"app", amount:440 },
  { id:"522792048875", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Aoife Walsh", createdate:"2026-09-24T16:59:34Z", stage:"app", amount:440 },
  { id:"522858649838", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Mavis Rolston", createdate:"2026-09-24T17:14:13Z", stage:"app", amount:440 },
  { id:"522859613393", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mallow for Èabha O' Leary", createdate:"2026-09-24T17:46:02Z", stage:"app", amount:440 },
  { id:"522876033260", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anne Gilsenan", createdate:"2026-09-24T17:56:48Z", stage:"app", amount:440 },
  { id:"522862244057", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Bray for Sinead Hennessy", createdate:"2026-09-24T19:36:14Z", stage:"app", amount:440 },
  { id:"522878230725", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Oksana Guzieieva", createdate:"2026-09-24T20:03:24Z", stage:"app", amount:455 },
  { id:"522878071005", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Annalise Doran", createdate:"2026-09-24T20:54:08Z", stage:"app", amount:440 },
  { id:"522877647074", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Annalise Soran", createdate:"2026-09-24T21:04:44Z", stage:"won", amount:440 },
  { id:"522844709111", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Pauline Doogan", createdate:"2026-09-24T21:07:03Z", stage:"app", amount:440 },
  { id:"522888105198", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Sally Billing", createdate:"2026-09-25T05:01:51Z", stage:"app", amount:440 },
  { id:"522916739272", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Niamh Killerlane", createdate:"2026-09-25T07:49:39Z", stage:"app", amount:440 },
];

// ─── PARSING ─────────────────────────────────────────────────────────────────
const DEPT_MAP   = { DSN:"SNA", DHC:"Healthcare", DSC:"Social Care", DBU:"Business", ELC:"ELC", DHP:"Healthcare" };
const DELIV_MAP  = { OA:"Online Anytime", LO:"Live and Online", CNY:"Classroom Near You" };
const DEPT_ORDER = ["SNA","Healthcare","Social Care","Business","ELC","Other"];
const DEPT_COLOR = {
  SNA:          "#38bdf8",
  Healthcare:   "#34d399",
  "Social Care":"#a78bfa",
  Business:     "#fb923c",
  ELC:          "#f472b6",
  Other:        "#64748b",
};

function parseDeal(d) {
  const m = d.dealname.match(/\(([^)]+)\)/);
  const codeBlock = m ? m[1] : "";
  const tokens = codeBlock.split(/\s+/);
  const courseCode = tokens[0] || "";

  const levelDigit = courseCode.match(/^(\d)/)?.[1] || "";
  const level = levelDigit ? `L${levelDigit}` : "";

  let delivCode = "", deptCode = "";
  for (const t of tokens.slice(1)) {
    if (DELIV_MAP[t]) delivCode = t;
    if (DEPT_MAP[t])  deptCode  = t;
  }

  const dept     = DEPT_MAP[deptCode]  || "Healthcare";
  const delivery = DELIV_MAP[delivCode] || "Online Anytime";

  const DELIV_SUFFIXES = [
    " - Online Anytime 1:1", " - Online Anytime",
    " - Live and Online", " - Classroom Near You",
  ];
  let rawName = m
    ? d.dealname.slice(0, m.index).replace(/\s*[-–]\s*$/, "").trim()
    : d.dealname;
  rawName = rawName.replace(/\s*\([^)]*\)\s*$/, "").trim();
  for (const suffix of DELIV_SUFFIXES) {
    if (rawName.endsWith(suffix)) { rawName = rawName.slice(0, -suffix.length).trim(); break; }
  }
  const courseName  = rawName;
  const courseLabel = level ? `${courseName} ${level}` : courseName;

  let location = "";
  if (delivCode === "CNY" && m) {
    const after = d.dealname.slice(m.index + m[0].length);
    const lm = after.match(/^\s*[-–]\s*(.+?)\s+for\s+/i);
    if (lm) location = lm[1].trim();
  }

  const dt     = new Date(d.createdate);
  // Normalise amount: HubSpot returns a string or null; store as number (0 if missing)
  const amount = parseFloat(d.amount) || 0;

  return { ...d, courseName, courseLabel, courseCode, level, delivCode, delivery, dept, deptCode, location, dt, amount };
}

const DEALS = RAW_DEALS.map(parseDeal);

// ─── WEEK BUCKETS ─────────────────────────────────────────────────────────────
const WEEKS = [
  { wk:"W1", label:"27 Jul–2 Aug", start:new Date("2026-07-26T23:00:00Z"), end:new Date("2026-08-02T22:59:59Z"), full:true },
  { wk:"W2", label:"3 Aug–9 Aug", start:new Date("2026-08-02T23:00:00Z"), end:new Date("2026-08-09T22:59:59Z"), full:true },
  { wk:"W3", label:"10 Aug–16 Aug", start:new Date("2026-08-09T23:00:00Z"), end:new Date("2026-08-16T22:59:59Z"), full:true },
  { wk:"W4", label:"17 Aug–23 Aug", start:new Date("2026-08-16T23:00:00Z"), end:new Date("2026-08-23T22:59:59Z"), full:true },
  { wk:"W5", label:"24 Aug–30 Aug", start:new Date("2026-08-23T23:00:00Z"), end:new Date("2026-08-30T22:59:59Z"), full:true },
  { wk:"W6", label:"31 Aug–6 Sep", start:new Date("2026-08-30T23:00:00Z"), end:new Date("2026-09-06T22:59:59Z"), full:true },
  { wk:"W7", label:"7 Sep–13 Sep", start:new Date("2026-09-06T23:00:00Z"), end:new Date("2026-09-13T22:59:59Z"), full:true },
  { wk:"W8", label:"14 Sep–20 Sep", start:new Date("2026-09-13T23:00:00Z"), end:new Date("2026-09-20T22:59:59Z"), full:true },
  { wk:"W9", label:"21 Sep–25 Sep ⚡", start:new Date("2026-09-20T23:00:00Z"), end:new Date("2026-09-25T08:44:07Z"), full:false },
];

function countWeek(deals, wk) {
  return deals.filter(d => d.dt >= wk.start && d.dt <= wk.end);
}

function buildWeeklyData(deals) {
  return WEEKS.map(wk => {
    const inWk    = countWeek(deals, wk);
    const apps    = inWk.filter(d => d.stage === "app").length;
    const won     = inWk.filter(d => d.stage === "won").length;
    const total   = apps + won;
    const revenue = inWk.filter(d => d.stage === "won").reduce((s, d) => s + d.amount, 0);
    const convRate = total > 0 ? Math.round(won / total * 100) : 0;
    return { week: wk.label, wk: wk.wk, apps, won, total, revenue, convRate, full: wk.full };
  });
}

// ─── FILTER HELPERS ──────────────────────────────────────────────────────────
function getDeliveryTypes(deals) {
  const s = new Set(deals.map(d => d.delivery).filter(Boolean));
  return [...s].sort();
}

function getCourses(deals) {
  const map = {};
  for (const d of deals) {
    const key = d.courseLabel;
    if (!map[key]) map[key] = { courseLabel: d.courseLabel, courseName: d.courseName, courseCode: d.courseCode, dept: d.dept };
  }
  return Object.values(map).sort((a,b) => a.courseLabel.localeCompare(b.courseLabel));
}

function getLocations(deals) {
  const s = new Set(deals.map(d => d.location).filter(Boolean));
  return [...s].sort();
}

// ─── FORMATTING ──────────────────────────────────────────────────────────────
function fmtEur(n) {
  if (!n) return "€0";
  return "€" + n.toLocaleString("en-IE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ─── COLORS & STYLES ─────────────────────────────────────────────────────────
const C = {
  app:"#38bdf8", won:"#34d399", rate:"#a78bfa", rev:"#fbbf24",
  bg:"#0f172a", card:"#1e293b", border:"#334155", muted:"#64748b", text:"#f1f5f9", sub:"#94a3b8"
};

// ─── TOOLTIP ─────────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d       = payload[0]?.payload;
  const apps    = payload.find(p => p.dataKey === "apps")?.value ?? 0;
  const won     = payload.find(p => p.dataKey === "won")?.value ?? 0;
  const revenue = d?.revenue ?? 0;
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px", fontSize:13, color:C.text, minWidth:220 }}>
      <p style={{ fontWeight:700, marginBottom:8, color:C.sub }}>{label}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
          <span style={{ color:C.app }}>● Applications received</span><strong>{apps}</strong>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
          <span style={{ color:C.won }}>● Invoiced Won</span><strong>{won}</strong>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", gap:16 }}>
          <span style={{ color:C.rev }}>● Revenue</span><strong>{fmtEur(revenue)}</strong>
        </div>
        <div style={{ borderTop:`1px solid ${C.border}`, marginTop:4, paddingTop:4, display:"flex", justifyContent:"space-between" }}>
          <span style={{ color:C.rate }}>Conv. rate</span>
          <strong style={{ color:C.rate }}>{d?.convRate ?? 0}%</strong>
        </div>
      </div>
      {!d?.full && <p style={{ margin:"6px 0 0", color:"#fbbf24", fontSize:11 }}>⚡ Partial week</p>}
    </div>
  );
};

// ─── TAB BUTTON ──────────────────────────────────────────────────────────────
const Tab = ({ id, active, onClick, children }) => (
  <button onClick={() => onClick(id)} style={{
    padding:"5px 14px", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer",
    border:`1px solid ${active ? C.app : C.border}`,
    background: active ? "rgba(56,189,248,0.15)" : "transparent",
    color: active ? C.app : C.muted,
  }}>{children}</button>
);

// ─── PILL ─────────────────────────────────────────────────────────────────────
const Pill = ({ label, active, color, onClick }) => (
  <button onClick={onClick} style={{
    padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600, cursor:"pointer",
    border:`1px solid ${active ? color : C.border}`,
    background: active ? `${color}22` : "transparent",
    color: active ? color : C.muted,
    transition:"all .15s",
  }}>{label}</button>
);

// ─── STAT CARD ───────────────────────────────────────────────────────────────
const Stat = ({ label, value, sub, color }) => (
  <div style={{ background:C.card, borderRadius:10, padding:"12px 16px", flex:"1 1 100px", border:`1px solid ${C.border}` }}>
    <p style={{ margin:"0 0 3px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
    <p style={{ margin:"0 0 2px", fontSize:22, fontWeight:800, color: color||C.text, lineHeight:1 }}>{value}</p>
    <p style={{ margin:0, fontSize:10, color:C.muted }}>{sub}</p>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [chartView,    setChartView]    = useState("grouped");
  const [tableSort,    setTableSort]    = useState({ col: null, dir: "desc" });

  function handleTableSort(col) {
    setTableSort(prev =>
      prev.col === col
        ? { col, dir: prev.dir === "desc" ? "asc" : "desc" }
        : { col, dir: "desc" }
    );
  }

  const [selDept,      setSelDept]      = useState("All");
  const [selDelivery,  setSelDelivery]  = useState("All");
  const [selCourse,    setSelCourse]    = useState("All");
  const [selLocation,  setSelLocation]  = useState("All");

  function chooseDept(d) {
    setSelDept(d); setSelDelivery("All"); setSelCourse("All"); setSelLocation("All");
  }
  function chooseDelivery(d) {
    setSelDelivery(d); setSelCourse("All"); setSelLocation("All");
  }
  function chooseCourse(c) {
    setSelCourse(c); setSelLocation("All");
  }

  const filtered = useMemo(() => {
    let deals = DEALS;
    if (selDept     !== "All") deals = deals.filter(d => d.dept       === selDept);
    if (selDelivery !== "All") deals = deals.filter(d => d.delivery   === selDelivery);
    if (selCourse   !== "All") deals = deals.filter(d => d.courseLabel === selCourse);
    if (selLocation !== "All") deals = deals.filter(d => d.location   === selLocation);
    return deals;
  }, [selDept, selDelivery, selCourse, selLocation]);

  const weeklyData    = useMemo(() => buildWeeklyData(filtered), [filtered]);
  const totalApps     = filtered.filter(d => d.stage === "app").length;
  const totalWon      = filtered.filter(d => d.stage === "won").length;
  const totalDeals    = totalApps + totalWon;
  const totalRevenue  = filtered.filter(d => d.stage === "won").reduce((s, d) => s + d.amount, 0);
  const convRate      = totalDeals > 0 ? Math.round(totalWon / totalDeals * 100) : 0;
  const avgConv       = (() => {
    const full = weeklyData.filter(w => w.full);
    if (!full.length) return 0;
    return Math.round(full.reduce((s,w) => s + w.convRate, 0) / full.length);
  })();

  const availDepts     = ["All", ...DEPT_ORDER.filter(dep => DEALS.some(d => d.dept === dep))];
  const availDelivs    = useMemo(() => {
    const base = selDept === "All" ? DEALS : DEALS.filter(d => d.dept === selDept);
    return ["All", ...getDeliveryTypes(base)];
  }, [selDept]);
  const availCourses   = useMemo(() => {
    let base = DEALS;
    if (selDept     !== "All") base = base.filter(d => d.dept     === selDept);
    if (selDelivery !== "All") base = base.filter(d => d.delivery === selDelivery);
    return ["All", ...getCourses(base).map(c => c.courseLabel)];
  }, [selDept, selDelivery]);
  const availLocations = useMemo(() => {
    let base = DEALS;
    if (selDept     !== "All") base = base.filter(d => d.dept       === selDept);
    if (selDelivery !== "All") base = base.filter(d => d.delivery   === selDelivery);
    if (selCourse   !== "All") base = base.filter(d => d.courseLabel === selCourse);
    return getLocations(base);
  }, [selDept, selDelivery, selCourse]);

  const showLocationRow = selDelivery === "Classroom Near You" || availLocations.length > 0;

  const scopeLabel = [
    selDept     !== "All" ? selDept     : "All Departments",
    selDelivery !== "All" ? selDelivery : null,
    selCourse   !== "All" ? selCourse   : null,
    selLocation !== "All" ? `(${selLocation})` : null,
  ].filter(Boolean).join(" · ");

  const accentColor = selDept !== "All" ? DEPT_COLOR[selDept] : C.app;

  // Last week index for KPI card
  const lastWkIdx = weeklyData.length - 1;

  return (
    <div style={{ background:C.bg, minHeight:"100vh", padding:"28px 24px", fontFamily:"'Inter','Segoe UI',sans-serif", color:C.text, textAlign:"left" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom:20 }}>
        <p style={{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 5px" }}>
          HubSpot · B2C (Single Modules) Pipeline
        </p>
        <h1 style={{ margin:"0 0 4px", fontSize:21, fontWeight:700, color:C.text }}>
          Single Module Applications &amp; Conversions
        </h1>
        <p style={{ margin:0, color:C.sub, fontSize:13 }}>
          27 Jul – 25 Sep 2026 · W1–W8 + W9 ⚡
        </p>
      </div>

      {/* ── Filter Layer 1: Department ── */}
      <div style={{ marginBottom:12 }}>
        <p style={{ margin:"0 0 6px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Department</p>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {availDepts.map(dep => (
            <Pill key={dep} label={dep} active={selDept === dep}
              color={dep === "All" ? C.app : DEPT_COLOR[dep] || C.muted}
              onClick={() => chooseDept(dep)} />
          ))}
        </div>
      </div>

      {/* ── Filter Layer 2: Delivery Type ── */}
      <div style={{ marginBottom:12 }}>
        <p style={{ margin:"0 0 6px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Delivery Type</p>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {availDelivs.map(del => (
            <Pill key={del} label={del} active={selDelivery === del}
              color={accentColor} onClick={() => chooseDelivery(del)} />
          ))}
        </div>
      </div>

      {/* ── Filter Layer 3: Course ── */}
      {(selDept !== "All" || selDelivery !== "All") ? (
        <div style={{ marginBottom: showLocationRow ? 12 : 20 }}>
          <p style={{ margin:"0 0 6px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Course</p>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {availCourses.map(c => (
              <Pill key={c} label={c} active={selCourse === c}
                color={accentColor} onClick={() => chooseCourse(c)} />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ marginBottom:20, padding:"8px 12px", borderRadius:8,
          border:`1px dashed ${C.border}`, fontSize:11, color:C.muted, fontStyle:"italic" }}>
          Select a department or delivery type above to filter by course
        </div>
      )}

      {/* ── Filter Layer 4: Location (CNY only) ── */}
      {showLocationRow && (
        <div style={{ marginBottom:20 }}>
          <p style={{ margin:"0 0 6px", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Location (Classroom Near You)</p>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <Pill label="All" active={selLocation === "All"} color={accentColor} onClick={() => setSelLocation("All")} />
            {availLocations.map(loc => (
              <Pill key={loc} label={loc} active={selLocation === loc} color={accentColor} onClick={() => setSelLocation(loc)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Scope breadcrumb ── */}
      <div style={{ background:"rgba(56,189,248,0.06)", border:`1px solid ${C.border}`, borderRadius:8,
        padding:"8px 14px", marginBottom:20, fontSize:12, color:C.sub }}>
        <span style={{ color:accentColor, fontWeight:700 }}>📊 Viewing: </span>{scopeLabel}
        {" · "}<strong style={{ color:C.text }}>{totalDeals} deals total</strong>
      </div>

      {/* ── KPIs ── */}
      <div style={{ display:"flex", gap:10, marginBottom:22, flexWrap:"wrap" }}>
        <Stat label="Applications Received" value={totalApps}        sub="stages: self + 3rd party"   color={C.app} />
        <Stat label="Invoiced Won"           value={totalWon}         sub="successful payment"          color={C.won} />
        <Stat label="Revenue (Won)"          value={fmtEur(totalRevenue)} sub="sum of won deal amounts" color={C.rev} />
        <Stat label="Conversion Rate"        value={convRate+"%"}     sub="won ÷ total"                 color="#f472b6" />
        <Stat label={`This Week (W${lastWkIdx+1}${!weeklyData[lastWkIdx]?.full?" ⚡":""})`}
              value={`${weeklyData[lastWkIdx]?.apps||0}a / ${weeklyData[lastWkIdx]?.won||0}w`}
              sub={weeklyData[lastWkIdx]?.full ? "full week" : "partial week"}
              color="#fbbf24" />
      </div>

      {/* ── Chart toggle ── */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <Tab id="grouped"  active={chartView==="grouped"}  onClick={setChartView}>Side by side</Tab>
        <Tab id="stacked"  active={chartView==="stacked"}  onClick={setChartView}>Stacked</Tab>
        <Tab id="rate"     active={chartView==="rate"}     onClick={setChartView}>Conv. rate %</Tab>
        <Tab id="revenue"  active={chartView==="revenue"}  onClick={setChartView}>Revenue €</Tab>
      </div>

      {/* ── Chart ── */}
      <div style={{ background:C.card, borderRadius:12, padding:"22px 16px 14px", border:`1px solid ${C.border}`, marginBottom:20 }}>
        {totalDeals === 0 ? (
          <div style={{ height:260, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted, fontSize:13 }}>
            No deals match the current filter selection.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            {chartView === "rate" ? (
              <ComposedChart data={weeklyData} margin={{ top:8, right:20, left:-8, bottom:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="week" tick={{ fill:C.sub, fontSize:11 }} axisLine={{ stroke:C.border }} tickLine={false}/>
                <YAxis tick={{ fill:C.sub, fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => v+"%"} domain={[0,110]}/>
                <Tooltip content={<CustomTooltip/>} cursor={{ fill:"rgba(148,163,184,.06)" }}/>
                <ReferenceLine y={avgConv} stroke={C.muted} strokeDasharray="4 3"
                  label={{ value:`Avg ${avgConv}%`, fill:C.muted, fontSize:11, position:"insideTopRight" }}/>
                <Line dataKey="convRate" name="Conv. rate" type="monotone"
                  stroke={C.rate} strokeWidth={2.5}
                  dot={{ r:6, fill:C.rate, strokeWidth:0 }} connectNulls/>
              </ComposedChart>
            ) : chartView === "revenue" ? (
              <ComposedChart data={weeklyData} margin={{ top:8, right:20, left:8, bottom:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="week" tick={{ fill:C.sub, fontSize:11 }} axisLine={{ stroke:C.border }} tickLine={false}/>
                <YAxis tick={{ fill:C.sub, fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => "€"+v.toLocaleString("en-IE")}/>
                <Tooltip content={<CustomTooltip/>} cursor={{ fill:"rgba(148,163,184,.06)" }}/>
                <Bar dataKey="revenue" name="Revenue" fill={C.rev} radius={[5,5,0,0]}/>
              </ComposedChart>
            ) : (
              <ComposedChart data={weeklyData} margin={{ top:8, right:20, left:-8, bottom:8 }}
                barCategoryGap={chartView==="stacked"?"34%":"24%"} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false}/>
                <XAxis dataKey="week" tick={{ fill:C.sub, fontSize:11 }} axisLine={{ stroke:C.border }} tickLine={false}/>
                <YAxis tick={{ fill:C.sub, fontSize:11 }} axisLine={false} tickLine={false} domain={[0,'auto']}/>
                <Tooltip content={<CustomTooltip/>} cursor={{ fill:"rgba(148,163,184,.06)" }}/>
                <Legend wrapperStyle={{ paddingTop:14, fontSize:12 }}
                  formatter={v => v === "apps" ? "Applications received" : "Invoiced Won"}/>
                <Bar dataKey="apps" name="apps" fill={C.app}
                  radius={chartView==="stacked"?[0,0,0,0]:[5,5,0,0]}
                  stackId={chartView==="stacked"?"a":undefined}/>
                <Bar dataKey="won" name="won" fill={C.won}
                  radius={[5,5,0,0]}
                  stackId={chartView==="stacked"?"a":undefined}/>
              </ComposedChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Weekly table ── */}
      <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden", marginBottom:20 }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {["Wk","Dates","Apps Received","Won","Revenue","Total","Conv. Rate"].map((h,i) => (
                <th key={h} style={{ padding:"10px 14px", textAlign:i<=1?"left":"center",
                  color:C.muted, fontWeight:600, fontSize:11, textTransform:"uppercase",
                  letterSpacing:"0.06em", borderBottom:`1px solid ${C.border}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeklyData.map((row, i) => (
              <tr key={i} style={{ borderBottom:i<weeklyData.length-1?`1px solid #1e2d3d`:"none",
                background:i%2===0?C.card:"#162032" }}>
                <td style={{ padding:"10px 14px", color:C.muted, fontWeight:700 }}>{row.wk}</td>
                <td style={{ padding:"10px 14px", color:"#cbd5e1" }}>
                  {row.week.replace(" ⚡","")}{!row.full&&<span style={{ marginLeft:5, color:"#fbbf24", fontSize:10 }}>⚡</span>}
                </td>
                <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:C.app, fontSize:15 }}>{row.apps}</td>
                <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:C.won, fontSize:15 }}>{row.won}</td>
                <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:C.rev, fontSize:13 }}>{fmtEur(row.revenue)}</td>
                <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:C.text, fontSize:15 }}>{row.total}</td>
                <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, fontSize:12,
                  color: row.convRate >= 50 ? "#34d399" : C.rate }}>
                  {row.total > 0 ? row.convRate+"%" : "—"}{row.convRate >= 50 && row.total > 0 ? " 🔥" : ""}
                </td>
              </tr>
            ))}
            <tr style={{ background:C.bg, borderTop:`2px solid ${C.border}` }}>
              <td colSpan={2} style={{ padding:"10px 14px", color:C.sub, fontWeight:700, fontSize:10, textTransform:"uppercase" }}>Total</td>
              <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:800, color:C.app, fontSize:15 }}>{totalApps}</td>
              <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:800, color:C.won, fontSize:15 }}>{totalWon}</td>
              <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:800, color:C.rev, fontSize:13 }}>{fmtEur(totalRevenue)}</td>
              <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:800, color:C.text, fontSize:15 }}>{totalDeals}</td>
              <td style={{ padding:"10px 14px", textAlign:"center", fontWeight:700, color:"#34d399", fontSize:13 }}>{convRate}%</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── Course breakdown table ── */}
      <div style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ padding:"14px 16px 10px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <p style={{ margin:0, fontWeight:700, fontSize:13, color:C.text }}>Course Breakdown</p>
            <p style={{ margin:"2px 0 0", fontSize:11, color:C.muted }}>
              {tableSort.col ? `Sorted by ${tableSort.col} (${tableSort.dir === "desc" ? "high → low" : "low → high"})` : "Click a column header to sort"}
            </p>
          </div>
          {tableSort.col && (
            <button onClick={() => setTableSort({ col: null, dir: "desc" })} style={{
              fontSize:11, color:C.muted, background:"transparent", border:`1px solid ${C.border}`,
              borderRadius:6, padding:"3px 10px", cursor:"pointer"
            }}>✕ Reset sort</button>
          )}
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
          <thead>
            <tr style={{ background:C.bg }}>
              {[
                { label:"Department", col:null,      align:"left"   },
                { label:"Course",     col:null,      align:"left"   },
                { label:"Delivery",   col:null,      align:"left"   },
                { label:"Location",   col:null,      align:"left"   },
                { label:"Apps",       col:"apps",    align:"center" },
                { label:"Won",        col:"won",     align:"center" },
                { label:"Revenue",    col:"revenue", align:"center" },
                { label:"Conv %",     col:"rate",    align:"center" },
              ].map(({ label, col, align }) => (
                <th key={label}
                  onClick={() => col && handleTableSort(col)}
                  style={{
                    padding:"9px 12px", textAlign:align,
                    color: col && tableSort.col === col ? C.text : C.muted,
                    fontWeight:600, fontSize:10, textTransform:"uppercase",
                    letterSpacing:"0.06em", borderBottom:`1px solid ${C.border}`,
                    cursor: col ? "pointer" : "default",
                    userSelect:"none",
                    background: col && tableSort.col === col ? "rgba(255,255,255,0.04)" : "transparent",
                    whiteSpace:"nowrap",
                  }}>
                  {label}
                  {col && (
                    <span style={{ marginLeft:4, opacity: tableSort.col === col ? 1 : 0.3 }}>
                      {tableSort.col === col ? (tableSort.dir === "desc" ? " ▼" : " ▲") : " ▼"}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const groups = {};
              for (const d of filtered) {
                const key = `${d.dept}||${d.courseLabel}||${d.delivery}||${d.location}`;
                if (!groups[key]) groups[key] = { dept:d.dept, courseLabel:d.courseLabel, delivery:d.delivery, location:d.location, apps:0, won:0, revenue:0 };
                if (d.stage === "app") groups[key].apps++;
                if (d.stage === "won") { groups[key].won++; groups[key].revenue += d.amount; }
              }
              const rows = Object.values(groups).map(g => ({
                ...g,
                total: g.apps + g.won,
                rate: (g.apps + g.won) > 0 ? Math.round(g.won / (g.apps + g.won) * 100) : 0,
              }));

              if (tableSort.col) {
                const dir = tableSort.dir === "desc" ? -1 : 1;
                rows.sort((a, b) => (b[tableSort.col] - a[tableSort.col]) * dir);
              } else {
                rows.sort((a,b) => DEPT_ORDER.indexOf(a.dept) - DEPT_ORDER.indexOf(b.dept) || a.courseLabel.localeCompare(b.courseLabel));
              }

              return rows.map((g, i) => {
                const dc = DEPT_COLOR[g.dept] || C.muted;
                return (
                  <tr key={i} style={{ borderBottom:`1px solid #1e2d3d`, background:i%2===0?C.card:"#162032" }}>
                    <td style={{ padding:"9px 12px" }}>
                      <span style={{ background:`${dc}22`, color:dc, padding:"2px 8px", borderRadius:10, fontSize:10, fontWeight:700 }}>{g.dept}</span>
                    </td>
                    <td style={{ padding:"9px 12px", color:"#cbd5e1", maxWidth:260 }}>{g.courseLabel}</td>
                    <td style={{ padding:"9px 12px", color:C.sub }}>{g.delivery}</td>
                    <td style={{ padding:"9px 12px", color:C.sub }}>{g.location || "—"}</td>
                    <td style={{ padding:"9px 12px", textAlign:"center", fontWeight:700,
                      color: tableSort.col === "apps" ? C.text : C.app }}>{g.apps}</td>
                    <td style={{ padding:"9px 12px", textAlign:"center", fontWeight:700,
                      color: tableSort.col === "won" ? C.text : C.won }}>{g.won}</td>
                    <td style={{ padding:"9px 12px", textAlign:"center", fontWeight:700,
                      color: tableSort.col === "revenue" ? C.text : C.rev }}>{fmtEur(g.revenue)}</td>
                    <td style={{ padding:"9px 12px", textAlign:"center", fontWeight:700,
                      color: g.rate >= 50 ? "#34d399" : C.rate }}>
                      {g.total > 0 ? g.rate+"%" : "—"}
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      <p style={{ marginTop:16, fontSize:10, color:C.muted, textAlign:"right" }}>
        Data: HubSpot B2C (Single Modules) pipeline · fetched 25 Sep 2026 · deal create date as week anchor
      </p>
    </div>
  );
}
