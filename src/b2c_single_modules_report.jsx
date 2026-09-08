import { useState, useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ─── RAW DEAL DATA (fetched 8 Sep 2026) ─────────────────────────────────────
// Stages: 5381718219 + 5381718220 = Application received | 756357056 = Won
// amount = deal amount from HubSpot (null / "" if not set; stored as number or 0)
const RAW_DEALS = [
  { id:"510159136988", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Emma O'Neill", createdate:"2026-07-14T21:20:42.015Z", stage:"app", amount:440 },
  { id:"510171730136", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Dearbhaile Mayclim", createdate:"2026-07-15T01:46:24.385Z", stage:"app", amount:440 },
  { id:"510208079093", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sharon Hickey", createdate:"2026-07-15T11:06:29.829Z", stage:"app", amount:440 },
  { id:"510110693611", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Bolaji Monsurat Adegbayi", createdate:"2026-07-15T11:17:37.248Z", stage:"app", amount:440 },
  { id:"510388675803", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anna Gavigan", createdate:"2026-07-16T12:57:07.883Z", stage:"app", amount:440 },
  { id:"510487579893", dealname:"Barista training (1169 CNY DBU) - Mullingar for Christopher Bookless", createdate:"2026-07-16T15:57:01.752Z", stage:"app", amount:0 },
  { id:"510472792305", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Geraldine Moran", createdate:"2026-07-16T16:18:14.834Z", stage:"app", amount:440 },
  { id:"510489483508", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Isabelle Meyler", createdate:"2026-07-16T17:21:55.784Z", stage:"app", amount:440 },
  { id:"510565759195", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Rachael Kehinde Abraham", createdate:"2026-07-17T07:30:10.957Z", stage:"app", amount:0 },
  { id:"510615946436", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for June Kelliher", createdate:"2026-07-17T12:52:06.039Z", stage:"app", amount:440 },
  { id:"511195293915", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Conor McCarthy", createdate:"2026-07-18T08:43:15.604Z", stage:"app", amount:0 },
  { id:"511245735098", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Marie O Sullivan o shea", createdate:"2026-07-18T13:06:40.127Z", stage:"app", amount:440 },
  { id:"511128440014", dealname:"Barista training (1169 CNY DBU) - Mullingar for Oran Sheridan", createdate:"2026-07-19T18:01:58.563Z", stage:"app", amount:0 },
  { id:"511291638979", dealname:"Barista training (1169 CNY DBU) - Mullingar for Olena Ryndia", createdate:"2026-07-20T03:46:03.661Z", stage:"app", amount:0 },
  { id:"511292155073", dealname:"Business Administration Skills - Online Anytime 1:1 (5N1610 OA DBU) -  for Diana Chaikovska", createdate:"2026-07-20T13:42:51.971Z", stage:"app", amount:295 },
  { id:"511437618424", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Lisa King", createdate:"2026-07-20T15:49:05.657Z", stage:"app", amount:295 },
  { id:"511986187459", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Sarah Kelly", createdate:"2026-07-22T13:49:16.330Z", stage:"app", amount:295 },
  { id:"512132184307", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sandra Loughlin", createdate:"2026-07-23T14:12:40.745Z", stage:"app", amount:440 },
  { id:"512317967592", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Pauline maguire", createdate:"2026-07-23T19:48:46.972Z", stage:"app", amount:440 },
  { id:"512961133817", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for niamh kelly", createdate:"2026-07-25T17:25:00.030Z", stage:"app", amount:440 },
  { id:"513226249429", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Michelle Healy", createdate:"2026-07-27T09:27:43.351Z", stage:"app", amount:440 },
  { id:"513368690922", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Kathleen Gallagher", createdate:"2026-07-27T11:41:04.403Z", stage:"app", amount:455 },
  { id:"513310049518", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Niamh Culleton", createdate:"2026-07-27T12:00:08.640Z", stage:"app", amount:455 },
  { id:"513446036726", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Thays Dutra", createdate:"2026-07-27T22:40:51.231Z", stage:"app", amount:295 },
  { id:"513644798154", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Srebrenka Stojanovic", createdate:"2026-07-28T15:09:15.014Z", stage:"app", amount:295 },
  { id:"513684338903", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Kathleen Gallagher", createdate:"2026-07-28T17:33:04.279Z", stage:"app", amount:295 },
  { id:"513618836721", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Marie O Sullivan O Shea", createdate:"2026-07-28T22:42:46.282Z", stage:"app", amount:440 },
  { id:"513800589540", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Anna Doherty", createdate:"2026-07-29T13:04:45.678Z", stage:"app", amount:295 },
  { id:"513886780657", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rebecca Davis", createdate:"2026-07-30T09:24:06.145Z", stage:"app", amount:440 },
  { id:"514024872150", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Amy Verling", createdate:"2026-07-30T18:02:46.275Z", stage:"app", amount:440 },
  { id:"514032645322", dealname:"Challenging Behaviour - Online Anytime 1:1 (5N1706 OA DSC) -  for Alona Trach", createdate:"2026-07-31T07:24:58.428Z", stage:"app", amount:380 },
  { id:"514085424335", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Annalee Nallen", createdate:"2026-07-31T11:54:17.779Z", stage:"app", amount:440 },
  { id:"515024401639", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Abhiroop Bhattacharya", createdate:"2026-08-04T12:05:33.187Z", stage:"app", amount:440 },
  { id:"515003758786", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Elizabeth Mcmahon", createdate:"2026-08-04T14:04:18.711Z", stage:"app", amount:455 },
  { id:"515039868096", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Sorcha O Dea", createdate:"2026-08-04T14:43:44.008Z", stage:"app", amount:295 },
  { id:"515062784216", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Jamie Scanlon", createdate:"2026-08-04T20:55:32.037Z", stage:"app", amount:440 },
  { id:"515108743382", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Michael Coughlan", createdate:"2026-08-05T10:55:10.006Z", stage:"app", amount:295 },
  { id:"515052622020", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Blueson Biju", createdate:"2026-08-05T16:00:40.769Z", stage:"app", amount:295 },
  { id:"515201299673", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Juan Gabriel Cordoba", createdate:"2026-08-05T17:36:30.212Z", stage:"app", amount:295 },
  { id:"515261380806", dealname:"Barista training (1169 CNY DBU) - Mullingar for Treasa Shaw", createdate:"2026-08-06T21:23:47.188Z", stage:"app", amount:0 },
  { id:"515350260943", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Siobhan Doherty", createdate:"2026-08-07T09:33:19.918Z", stage:"app", amount:440 },
  { id:"515350870218", dealname:"Business Administration Skills - Online Anytime 1:1 (5N1610 OA DBU) -  for Millie Earley", createdate:"2026-08-07T11:16:49.674Z", stage:"app", amount:295 },
  { id:"515633534172", dealname:"Barista training (1169 CNY DBU) - Mullingar for Helen Nannery", createdate:"2026-08-10T19:56:23.897Z", stage:"app", amount:0 },
  { id:"515745638608", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Camelia Hangan", createdate:"2026-08-10T22:39:31.414Z", stage:"app", amount:440 },
  { id:"515739381961", dealname:"Communications (Healthcare) - Online Anytime 1:1 (5N0690 OA DHC) -  for Ashling Fairbrother", createdate:"2026-08-11T12:49:38.094Z", stage:"app", amount:295 },
  { id:"516108258543", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Fiona Scarlett", createdate:"2026-08-11T15:01:37.989Z", stage:"app", amount:295 },
  { id:"516122631359", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Catherine Gogan", createdate:"2026-08-11T20:16:23.071Z", stage:"app", amount:295 },
  { id:"516070541560", dealname:"Barista training (1169 CNY DBU) - Mullingar for André Marx", createdate:"2026-08-12T05:48:11.236Z", stage:"app", amount:0 },
  { id:"516362988787", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Ralph Sulayi manda", createdate:"2026-08-12T15:22:32.998Z", stage:"app", amount:295 },
  { id:"516382823648", dealname:"Barista training (1169 CNY DBU) - Mullingar for Ciaran Monaghan", createdate:"2026-08-12T16:11:32.816Z", stage:"app", amount:0 },
  { id:"516549595336", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Eimear Dykes", createdate:"2026-08-13T11:51:02.632Z", stage:"app", amount:440 },
  { id:"516730614985", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Rachel Bulman", createdate:"2026-08-13T21:59:57.284Z", stage:"app", amount:440 },
  { id:"516711154875", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Just wondering is this course online?", createdate:"2026-08-14T06:42:27.452Z", stage:"app", amount:440 },
  { id:"516702006464", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Gillian Cooney", createdate:"2026-08-14T06:47:14.085Z", stage:"app", amount:440 },
  { id:"516939040974", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Aisling Bhreathnach", createdate:"2026-08-14T18:56:07.075Z", stage:"app", amount:455 },
  { id:"516879577291", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aisling Bhreathnach", createdate:"2026-08-14T19:10:59.336Z", stage:"app", amount:440 },
  { id:"516945542375", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Portlaoise for Aobha Doyle Byrne", createdate:"2026-08-15T16:03:07.543Z", stage:"app", amount:440 },
  { id:"516957986013", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Jill Fleming", createdate:"2026-08-15T17:22:16.897Z", stage:"app", amount:440 },
  { id:"517052664019", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Melissa Griffin", createdate:"2026-08-16T18:22:56.364Z", stage:"app", amount:455 },
  { id:"517029502171", dealname:"Supervisory Management - Online Anytime 1:1 (6N4329 OA DBU) -  for Sonia O Neill", createdate:"2026-08-17T09:58:08.715Z", stage:"app", amount:380 },
  { id:"517056297182", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Leniara Da Silveira", createdate:"2026-08-17T14:48:50.693Z", stage:"app", amount:295 },
  { id:"517272477918", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Kate Quinn", createdate:"2026-08-17T22:16:15.190Z", stage:"app", amount:295 },
  { id:"517432612059", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rebecca Gibney Armstrong", createdate:"2026-08-19T09:17:40.594Z", stage:"app", amount:440 },
  { id:"517258759365", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Melanie Boazman", createdate:"2026-08-18T09:39:38.529Z", stage:"app", amount:440 },
  { id:"517239920833", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Jade Oladipo", createdate:"2026-08-18T11:34:48.361Z", stage:"app", amount:295 },
  { id:"517287497919", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Fiona Collins", createdate:"2026-08-18T12:20:57.864Z", stage:"app", amount:440 },
  { id:"517466641622", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Jorja Yates", createdate:"2026-08-18T14:14:44.313Z", stage:"app", amount:440 },
  { id:"517507449020", dealname:"Human Growth and Development - Online Anytime 1:1 (5N1279 OA DHC) -  for Maryan ahmed Mohamud", createdate:"2026-08-18T15:54:29.212Z", stage:"app", amount:295 },
  { id:"517527524571", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Tahlya Kelly", createdate:"2026-08-19T14:34:53.804Z", stage:"app", amount:295 },
  { id:"517635035348", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Maureen Canavan", createdate:"2026-08-19T16:41:32.000Z", stage:"app", amount:440 },
  { id:"517653057755", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Michelle McCaul", createdate:"2026-08-19T17:09:26.169Z", stage:"app", amount:440 },
  { id:"517633286362", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Portlaoise for Andrea Hamm", createdate:"2026-08-19T17:15:03.744Z", stage:"app", amount:440 },
  { id:"517644859608", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Mary Hume", createdate:"2026-08-20T10:49:59.632Z", stage:"app", amount:295 },
  { id:"517682575585", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Lorraine Monaghan Bird", createdate:"2026-08-20T11:11:01.650Z", stage:"app", amount:0 },
  { id:"517700284617", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for sandra loughlin", createdate:"2026-08-20T16:15:06.393Z", stage:"app", amount:455 },
  { id:"517803926770", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for When is the next SNA course Beginning", createdate:"2026-08-22T00:09:34.156Z", stage:"app", amount:440 },
  { id:"517929195712", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Alistair Elliman", createdate:"2026-08-24T10:10:35.486Z", stage:"app", amount:440 },
  { id:"518057482470", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Samantha Sykes", createdate:"2026-08-24T20:46:46.020Z", stage:"app", amount:440 },
  { id:"518068930790", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Debbie Lynskey", createdate:"2026-08-25T12:36:24.370Z", stage:"app", amount:440 },
  { id:"518188957886", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Enya O Rourke", createdate:"2026-08-25T14:19:18.332Z", stage:"app", amount:440 },
  { id:"518006554848", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Laura Gavigan", createdate:"2026-08-25T14:45:38.180Z", stage:"app", amount:440 },
  { id:"518017307874", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Veronica Streete", createdate:"2026-08-25T15:13:14.801Z", stage:"app", amount:440 },
  { id:"518081250523", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Síofra Tuffy", createdate:"2026-08-25T17:22:58.230Z", stage:"app", amount:440 },
  { id:"518284067012", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Bernie Burke", createdate:"2026-08-25T18:23:08.370Z", stage:"app", amount:440 },
  { id:"518345346261", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Bridget Wickham", createdate:"2026-08-25T18:49:21.735Z", stage:"app", amount:440 },
  { id:"518312341726", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Elaine Tully", createdate:"2026-08-25T20:04:03.044Z", stage:"app", amount:440 },
  { id:"518320191705", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Frances Brosnan", createdate:"2026-08-25T20:22:48.527Z", stage:"app", amount:440 },
  { id:"518273340619", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Catherine Murphy", createdate:"2026-08-25T20:39:56.267Z", stage:"app", amount:440 },
  { id:"518424805567", dealname:"Understanding Mental Health - Online Anytime 1:1 (5N3772 OA DHC) -  for Hayley Cunningham", createdate:"2026-08-26T05:23:08.465Z", stage:"app", amount:295 },
  { id:"518371012802", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Fern Bohill", createdate:"2026-08-26T06:07:09.423Z", stage:"app", amount:440 },
  { id:"518435636461", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Clare Wilson", createdate:"2026-08-26T06:42:28.811Z", stage:"app", amount:440 },
  { id:"518539073744", dealname:"Psychology - Online Anytime 1:1 (5N0754 OA DHC) -  for Fiona Larkin", createdate:"2026-08-26T13:11:41.113Z", stage:"app", amount:295 },
  { id:"518479224027", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Alana Casey", createdate:"2026-08-26T13:06:10.373Z", stage:"app", amount:295 },
  { id:"518467740912", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Jovanna Maria Fernandes Reis", createdate:"2026-08-26T13:18:31.171Z", stage:"app", amount:295 },
  { id:"518391580890", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lauren Devine", createdate:"2026-08-26T13:23:19.855Z", stage:"app", amount:440 },
  { id:"518445093070", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Paula Sheridan", createdate:"2026-08-26T14:12:05.432Z", stage:"app", amount:440 },
  { id:"518436133061", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for trudy walsh", createdate:"2026-08-26T14:26:03.430Z", stage:"app", amount:440 },
  { id:"518474564821", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Danielle Daltin", createdate:"2026-08-26T17:15:45.087Z", stage:"app", amount:440 },
  { id:"518553456877", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Shauna Mcdonnell", createdate:"2026-08-26T17:57:05.095Z", stage:"app", amount:440 },
  { id:"518557074678", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Nicola OHIGGINS", createdate:"2026-08-26T19:31:08.215Z", stage:"app", amount:295 },
  { id:"518463197393", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Trudy Walsh", createdate:"2026-08-26T20:11:47.595Z", stage:"app", amount:440 },
  { id:"518479565025", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Claire Randles", createdate:"2026-08-26T20:14:02.387Z", stage:"app", amount:440 },
  { id:"518594364635", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Katie O'Connor", createdate:"2026-08-27T14:15:58.999Z", stage:"app", amount:440 },
  { id:"518596236537", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sandra Harvey", createdate:"2026-08-27T15:34:46.439Z", stage:"app", amount:440 },
  { id:"518579367139", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Liz Gillen", createdate:"2026-08-27T16:05:33.150Z", stage:"app", amount:440 },
  { id:"518543624388", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for olanrewaju atobatele", createdate:"2026-08-27T17:31:13.878Z", stage:"app", amount:295 },
  { id:"518616946902", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Joseph Ganley", createdate:"2026-08-27T21:22:33.447Z", stage:"app", amount:295 },
  { id:"518634840283", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Mairèad Kinsella", createdate:"2026-08-28T08:27:54.127Z", stage:"app", amount:440 },
  { id:"518580017340", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Majella McGlinchey Boylan", createdate:"2026-08-28T08:42:41.298Z", stage:"app", amount:440 },
  { id:"518560598224", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Geraldine East", createdate:"2026-08-28T10:02:16.519Z", stage:"app", amount:440 },
  { id:"518877929665", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Tiffany Walsh", createdate:"2026-08-28T18:45:44.458Z", stage:"app", amount:440 },
  { id:"518879758534", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Sinead Browne", createdate:"2026-08-28T19:42:25.142Z", stage:"app", amount:440 },
  { id:"518924043470", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Jessica Hickey", createdate:"2026-08-28T20:40:20.252Z", stage:"app", amount:295 },
  { id:"518851733714", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Tasha Quinn", createdate:"2026-08-29T10:54:53.024Z", stage:"app", amount:440 },
  { id:"518807332048", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Shannon Mcgrath", createdate:"2026-08-29T13:00:26.354Z", stage:"app", amount:295 },
  { id:"518919213277", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Julia Nevin", createdate:"2026-08-29T13:37:07.707Z", stage:"app", amount:455 },
  { id:"518855468233", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Elizabeth Sheridan", createdate:"2026-08-29T15:07:19.700Z", stage:"app", amount:440 },
  { id:"518880516326", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Roisin Browne", createdate:"2026-08-29T20:07:19.930Z", stage:"app", amount:440 },
  { id:"518850327742", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Hazel Nolan", createdate:"2026-08-29T20:45:04.575Z", stage:"app", amount:440 },
  { id:"518825742562", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Kate Farrell", createdate:"2026-08-29T21:47:00.011Z", stage:"app", amount:295 },
  { id:"518818593994", dealname:"Supervisory Management (Healthcare) - Online Anytime 1:1 (6N4329 OA DHC) -  for Lacramioara Dascalu", createdate:"2026-08-30T00:43:30.278Z", stage:"app", amount:380 },
  { id:"518820242648", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Caitlin Dempsey", createdate:"2026-08-30T01:00:53.104Z", stage:"app", amount:440 },
  { id:"518942521570", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Paul O keeffe", createdate:"2026-08-30T08:00:13.838Z", stage:"app", amount:440 },
  { id:"518919888118", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Moira Elwood", createdate:"2026-08-30T11:53:16.842Z", stage:"app", amount:440 },
  { id:"518861499592", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Catherina O'Shea", createdate:"2026-08-30T12:55:25.747Z", stage:"app", amount:440 },
  { id:"518852576478", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Mairead O malley", createdate:"2026-08-30T13:15:04.874Z", stage:"app", amount:440 },
  { id:"518947932397", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Karen Mccolgan", createdate:"2026-08-30T14:48:20.012Z", stage:"app", amount:440 },
  { id:"518808263879", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Josie O Donnell", createdate:"2026-08-30T20:22:54.222Z", stage:"app", amount:440 },
  { id:"518960521445", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for madison diver", createdate:"2026-08-30T21:34:22.603Z", stage:"app", amount:440 },
  { id:"519020206329", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Michelle O Connor", createdate:"2026-08-30T22:31:28.393Z", stage:"app", amount:440 },
  { id:"519049663736", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Caroline Thorpe", createdate:"2026-08-31T10:18:48.988Z", stage:"app", amount:295 },
  { id:"518962748638", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Helen Mcgrane", createdate:"2026-08-31T10:25:37.232Z", stage:"app", amount:440 },
  { id:"519070392542", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lisa Bourke", createdate:"2026-08-31T15:04:00.357Z", stage:"app", amount:440 },
  { id:"519080623314", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Graham Clarkin", createdate:"2026-08-31T15:08:14.436Z", stage:"app", amount:440 },
  { id:"519081115862", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Gilmartin Sarah", createdate:"2026-08-31T15:48:01.971Z", stage:"app", amount:440 },
  { id:"519073092845", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Samantha McDonald", createdate:"2026-08-31T16:35:19.310Z", stage:"app", amount:440 },
  { id:"519190316248", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Amy McManus", createdate:"2026-08-31T19:54:38.151Z", stage:"app", amount:440 },
  { id:"519084966106", dealname:"Human Resources Management - Online Anytime 1:1 (6N3750 OA DBU) -  for Lisa Cullen", createdate:"2026-08-31T20:20:36.304Z", stage:"app", amount:380 },
  { id:"519123342528", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Luke Wilders", createdate:"2026-08-31T20:28:55.900Z", stage:"app", amount:295 },
  { id:"519142021368", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Ellen O Connell", createdate:"2026-09-01T08:07:32.594Z", stage:"app", amount:295 },
  { id:"519124356296", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Roisin Sheridan", createdate:"2026-09-01T09:24:07.331Z", stage:"app", amount:440 },
  { id:"519167451351", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Laura Dwyer", createdate:"2026-09-01T09:34:24.661Z", stage:"app", amount:440 },
  { id:"519217846517", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Olivia Hunt", createdate:"2026-09-01T10:48:08.406Z", stage:"app", amount:440 },
  { id:"519217881304", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Martina Cerrotta", createdate:"2026-09-01T11:19:30.285Z", stage:"app", amount:440 },
  { id:"519164168397", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Eileen Rowland", createdate:"2026-09-01T12:28:31.157Z", stage:"app", amount:295 },
  { id:"519093552360", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for JENNIFER MURRAY", createdate:"2026-09-01T16:13:13.603Z", stage:"app", amount:295 },
  { id:"519288336624", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Hollie Reville", createdate:"2026-09-01T17:50:48.282Z", stage:"app", amount:295 },
  { id:"519216510177", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Anthony Kelly", createdate:"2026-09-01T18:02:47.252Z", stage:"app", amount:440 },
  { id:"519249097951", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Drogheda for Gillian Clarkin", createdate:"2026-09-01T19:02:39.307Z", stage:"app", amount:440 },
  { id:"519288948962", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Enya Orourke", createdate:"2026-09-01T22:30:27.618Z", stage:"app", amount:440 },
  { id:"519311815918", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Allexia Roca", createdate:"2026-09-02T08:34:33.114Z", stage:"app", amount:440 },
  { id:"519316853963", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Lisa McGovern", createdate:"2026-09-02T09:05:35.601Z", stage:"app", amount:440 },
  { id:"519263152343", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Josephine Carolan", createdate:"2026-09-02T09:53:51.835Z", stage:"app", amount:440 },
  { id:"519335971003", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Josephine Carolan", createdate:"2026-09-02T10:31:32.323Z", stage:"app", amount:455 },
  { id:"519335328992", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Talita Cristina Pinheiro", createdate:"2026-09-02T10:11:28.042Z", stage:"app", amount:295 },
  { id:"519336607969", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Sethu Makapela", createdate:"2026-09-02T10:49:11.554Z", stage:"app", amount:0 },
  { id:"519345835222", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Sadie Naidoo", createdate:"2026-09-02T11:15:02.786Z", stage:"app", amount:440 },
  { id:"519342557412", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Angela Gillespie", createdate:"2026-09-02T12:52:27.783Z", stage:"app", amount:440 },
  { id:"519339313368", dealname:"Cleanpass (Level 3) - Classroom Near You (3N0574 CNY DCP) - Mullingar for  ", createdate:"2026-09-02T12:56:31.283Z", stage:"app", amount:0 },
  { id:"519351626999", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Tony Cummins", createdate:"2026-09-02T13:25:48.149Z", stage:"app", amount:295 },
  { id:"519351492841", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for John Cummins", createdate:"2026-09-02T13:29:36.040Z", stage:"app", amount:295 },
  { id:"519453711554", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for John Anthony Cummins", createdate:"2026-09-02T14:29:43.572Z", stage:"app", amount:295 },
  { id:"519419357394", dealname:"Cleanpass (Level 3) - Classroom Near You (3N0574 CNY DCP) - Mullingar for  ", createdate:"2026-09-02T15:51:46.779Z", stage:"app", amount:0 },
  { id:"519485806789", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Caoímhe Bond", createdate:"2026-09-02T15:59:12.048Z", stage:"app", amount:440 },
  { id:"519512782056", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Catherine Cheung", createdate:"2026-09-02T18:45:10.149Z", stage:"app", amount:440 },
  { id:"519479203040", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ashbourne for Denise Gough", createdate:"2026-09-02T19:39:17.511Z", stage:"app", amount:440 },
  { id:"519528911067", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for John Masterson", createdate:"2026-09-02T20:25:23.015Z", stage:"app", amount:440 },
  { id:"519440215255", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Ruth bowler", createdate:"2026-09-02T20:27:27.412Z", stage:"app", amount:440 },
  { id:"519465205982", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Caroline McCabe Traynor", createdate:"2026-09-03T00:00:12.968Z", stage:"app", amount:440 },
  { id:"519420249324", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for  ", createdate:"2026-09-03T08:31:56.895Z", stage:"app", amount:440 },
  { id:"519513613534", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Martina Mc greal", createdate:"2026-09-03T11:04:25.512Z", stage:"app", amount:440 },
  { id:"519384358106", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Rosy Holman", createdate:"2026-09-03T11:53:20.018Z", stage:"app", amount:440 },
  { id:"519467567346", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Martina McGreal", createdate:"2026-09-03T12:34:30.688Z", stage:"app", amount:440 },
  { id:"519506275517", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for pierce Mcgurk", createdate:"2026-09-03T13:43:10.022Z", stage:"app", amount:440 },
  { id:"519382567135", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Sinead Dunphy", createdate:"2026-09-03T14:26:57.078Z", stage:"app", amount:455 },
  { id:"519384632513", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Breda Rogers", createdate:"2026-09-03T16:30:34.224Z", stage:"app", amount:440 },
  { id:"519688084718", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Kate Mulvey McQuaid", createdate:"2026-09-03T18:40:22.420Z", stage:"app", amount:295 },
  { id:"519642593493", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Eileen Mckinney", createdate:"2026-09-03T18:40:34.338Z", stage:"app", amount:440 },
  { id:"519676820729", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Aine Jenkins", createdate:"2026-09-03T19:00:55.598Z", stage:"app", amount:440 },
  { id:"519749592269", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Lucy Gallagher", createdate:"2026-09-03T19:46:19.831Z", stage:"app", amount:440 },
  { id:"519753266384", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Sinead Horgan", createdate:"2026-09-03T20:45:08.752Z", stage:"app", amount:440 },
  { id:"519730030802", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Caroline Conlon", createdate:"2026-09-03T21:03:19.684Z", stage:"app", amount:440 },
  { id:"519788408012", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Charlene Grogan", createdate:"2026-09-04T07:36:20.065Z", stage:"app", amount:440 },
  { id:"519888096473", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Yvonne Guilfoyle", createdate:"2026-09-04T10:54:07.486Z", stage:"app", amount:440 },
  { id:"519777160434", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Barbara Gunn", createdate:"2026-09-04T11:00:29.486Z", stage:"app", amount:440 },
  { id:"519878287581", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Alicia McInerney", createdate:"2026-09-04T11:59:25.277Z", stage:"app", amount:440 },
  { id:"519812140276", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Leanne Lynch", createdate:"2026-09-04T12:38:04.578Z", stage:"app", amount:440 },
  { id:"519835575499", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for  ", createdate:"2026-09-04T12:44:00.695Z", stage:"app", amount:440 },
  { id:"519913091291", dealname:"Business Administration Skills - Online Anytime 1:1 (5N1610 OA DBU) -  for Mary Kelly", createdate:"2026-09-04T12:51:35.617Z", stage:"app", amount:295 },
  { id:"519878385868", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Leann Wallace", createdate:"2026-09-04T13:33:36.633Z", stage:"app", amount:440 },
  { id:"519801442532", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Mary Kelly", createdate:"2026-09-04T14:02:27.941Z", stage:"app", amount:440 },
  { id:"519878498528", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Nicola O Higgins", createdate:"2026-09-04T14:55:27.274Z", stage:"app", amount:455 },
  { id:"519782862073", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Aine Mc Loughlin", createdate:"2026-09-04T18:41:01.024Z", stage:"app", amount:440 },
  { id:"519835890887", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for María Cristina Martín Martín", createdate:"2026-09-04T19:28:15.262Z", stage:"app", amount:455 },
  { id:"519775692992", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Katriona Smyth", createdate:"2026-09-04T19:42:42.535Z", stage:"app", amount:440 },
  { id:"519902309574", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Stephanie Fitzgerald", createdate:"2026-09-04T20:20:44.302Z", stage:"app", amount:440 },
  { id:"519789084890", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for  ", createdate:"2026-09-04T20:40:06.003Z", stage:"app", amount:440 },
  { id:"519868024051", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Emma Stapleton", createdate:"2026-09-04T21:14:05.926Z", stage:"app", amount:295 },
  { id:"519863432429", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Angela Fitzpatrick", createdate:"2026-09-04T21:25:06.785Z", stage:"app", amount:440 },
  { id:"520004676813", dealname:"Palliative Care Support - Online Anytime 1:1 (5N3769 OA DHC) -  for Joel Sono", createdate:"2026-09-05T00:26:43.348Z", stage:"app", amount:295 },
  { id:"519997575412", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Angelica Marini", createdate:"2026-09-05T04:35:06.889Z", stage:"app", amount:295 },
  { id:"519969249510", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Caroline Ryan", createdate:"2026-09-05T05:21:37.512Z", stage:"app", amount:440 },
  { id:"520003133641", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Andrew Swanick", createdate:"2026-09-05T09:14:20.694Z", stage:"app", amount:440 },
  { id:"519953508545", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for shauna mcgonagle", createdate:"2026-09-05T16:05:38.001Z", stage:"app", amount:440 },
  { id:"520031240441", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Theresa White", createdate:"2026-09-05T16:23:07.912Z", stage:"app", amount:440 },
  { id:"519964372189", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mallow for Maria Mccarthy", createdate:"2026-09-05T18:52:50.704Z", stage:"app", amount:440 },
  { id:"520029556939", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Pauline Dennehy", createdate:"2026-09-05T20:03:41.244Z", stage:"app", amount:440 },
  { id:"519946411220", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Annmarie Taylor", createdate:"2026-09-05T20:31:50.959Z", stage:"app", amount:440 },
  { id:"519959532734", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Pauline Dennehy", createdate:"2026-09-06T10:36:15.187Z", stage:"app", amount:440 },
  { id:"519939825878", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Hazel McCormack", createdate:"2026-09-06T17:23:40.875Z", stage:"app", amount:440 },
  { id:"520014058735", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Philip Doherty", createdate:"2026-09-06T19:18:26.822Z", stage:"app", amount:440 },
  { id:"519952418025", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Aideen Farrelly", createdate:"2026-09-06T19:30:00.730Z", stage:"app", amount:440 },
  { id:"520097795317", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Aine McRory", createdate:"2026-09-06T20:33:18.684Z", stage:"app", amount:440 },
  { id:"520030317803", dealname:"Payroll Manual and Computerised - Online Anytime 1:1 (5N1546 OA DBU) -  for Aishling Murray", createdate:"2026-09-06T22:43:58.683Z", stage:"app", amount:395 },
  { id:"520159274199", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for +353879910836 Aircall new contact", createdate:"2026-09-07T09:18:17.690Z", stage:"app", amount:440 },
  { id:"520167133400", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Sarah Mackin", createdate:"2026-09-07T09:53:11.767Z", stage:"app", amount:440 },
  { id:"520171982072", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Jessica Davis", createdate:"2026-09-07T11:23:18.839Z", stage:"app", amount:440 },
  { id:"520172148978", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Fiona Paterson", createdate:"2026-09-07T11:39:23.109Z", stage:"app", amount:295 },
  { id:"520110537971", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Veronica McGrath", createdate:"2026-09-07T13:21:20.568Z", stage:"app", amount:440 },
  { id:"520235975914", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Megan Ryan", createdate:"2026-09-07T14:37:28.544Z", stage:"app", amount:440 },
  { id:"520219804906", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Chloe Ellard", createdate:"2026-09-07T14:59:01.354Z", stage:"app", amount:440 },
  { id:"520302595287", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Keri Melia", createdate:"2026-09-07T15:59:10.338Z", stage:"app", amount:295 },
  { id:"520316985564", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Grainne Deery", createdate:"2026-09-07T17:48:54.307Z", stage:"app", amount:440 },
  { id:"520250591473", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Sarah Walsh", createdate:"2026-09-07T17:53:41.244Z", stage:"app", amount:295 },
  { id:"520278662387", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Ann Fennelly", createdate:"2026-09-07T18:18:14.971Z", stage:"app", amount:440 },
  { id:"520380763342", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sue Ward", createdate:"2026-09-07T19:13:10.326Z", stage:"app", amount:440 },
  { id:"520399898844", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Edel Gilmartin", createdate:"2026-09-07T20:16:49.707Z", stage:"app", amount:440 },
  { id:"520327718134", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Katie Tunney", createdate:"2026-09-07T20:33:51.704Z", stage:"app", amount:440 },
  { id:"520338545878", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Anne Curley", createdate:"2026-09-07T20:54:22.415Z", stage:"app", amount:440 },
  { id:"520331350245", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Marilyn Fox", createdate:"2026-09-07T22:08:45.842Z", stage:"app", amount:440 },
  { id:"520387347692", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Brenda Tuite", createdate:"2026-09-07T22:57:12.890Z", stage:"app", amount:0 },
  { id:"520405353710", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Nadine Harkin", createdate:"2026-09-08T08:09:27.515Z", stage:"app", amount:440 },
  { id:"520363563223", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Sinead Lynch", createdate:"2026-09-08T10:38:33.108Z", stage:"app", amount:0 },
  { id:"520376208614", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Lydia Kelly", createdate:"2026-09-08T11:09:23.336Z", stage:"app", amount:440 },
  { id:"520370659536", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Robert Marry", createdate:"2026-09-08T11:09:54.489Z", stage:"app", amount:440 },
  { id:"520353527012", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Linda Victory", createdate:"2026-09-08T11:28:42.018Z", stage:"app", amount:440 },
  { id:"510139523264", dealname:"Barista training (1169 CNY DBU) - Mullingar for Brendan Tape", createdate:"2026-07-14T13:56:52.128Z", stage:"app", amount:0 },
  { id:"510140278974", dealname:"Barista training (1169 CNY DBU) - Mullingar for Leesha Whyte", createdate:"2026-07-14T14:40:21.795Z", stage:"app", amount:0 },
  { id:"510177593572", dealname:"Barista training (1169 CNY DBU) - Mullingar for Arwa Alkhalifa", createdate:"2026-07-15T01:46:06.929Z", stage:"app", amount:0 },
  { id:"510476278998", dealname:"Barista training (1169 CNY DBU) - Mullingar for Emma Rose Boshuijer", createdate:"2026-07-16T14:09:38.710Z", stage:"app", amount:0 },
  { id:"510855113973", dealname:"Barista training (1169 CNY DBU) - Mullingar for Elizabeth Farrell", createdate:"2026-07-17T13:47:37.929Z", stage:"app", amount:0 },
  { id:"511141536976", dealname:"Barista training (1169 CNY DBU) - Mullingar for Hannah Fagan", createdate:"2026-07-17T21:41:25.731Z", stage:"app", amount:0 },
  { id:"511543498959", dealname:"Business Administration Skills - Online Anytime 1:1 (5N1610 OA DBU) -  for Estevam Alves de Oliveira", createdate:"2026-07-20T22:40:06.684Z", stage:"app", amount:295 },
  { id:"511989268723", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for SANDRA O'BRIEN", createdate:"2026-07-21T22:17:48.970Z", stage:"app", amount:440 },
  { id:"512340209850", dealname:"Conflict Management - Online Anytime 1:1 (6N2775 OA DHC) -  for Jennifer Whelan", createdate:"2026-07-23T08:50:08.714Z", stage:"app", amount:380 },
  { id:"512135469282", dealname:"Text Production - Online Anytime 1:1 (5N1422 OA DBU) -  for Serena O'Kane", createdate:"2026-07-23T09:55:41.888Z", stage:"app", amount:295 },
  { id:"513338051827", dealname:"Text Production - Online Anytime 1:1 (5N1422 OA DBU) -  for Serena O'Kane", createdate:"2026-07-27T09:21:16.825Z", stage:"app", amount:295 },
  { id:"515039198457", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ellie O Sullivan", createdate:"2026-08-04T13:45:10.549Z", stage:"app", amount:440 },
  { id:"515350230238", dealname:"Barista training (1169 CNY DBU) - Mullingar for Beth Atli", createdate:"2026-08-07T09:27:08.860Z", stage:"app", amount:0 },
  { id:"515350785219", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Khrystyna Zabolotna", createdate:"2026-08-07T12:29:45.224Z", stage:"app", amount:440 },
  { id:"516760289480", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Niall Anthony Lombard", createdate:"2026-08-13T20:20:23.618Z", stage:"app", amount:440 },
  { id:"516784179446", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Anna Johnston", createdate:"2026-08-14T12:42:41.878Z", stage:"app", amount:0 },
  { id:"516907597040", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Mark Lynch", createdate:"2026-08-15T12:54:16.592Z", stage:"app", amount:0 },
  { id:"517516869870", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rebecca Gibney", createdate:"2026-08-19T09:16:09.578Z", stage:"app", amount:440 },
  { id:"518395298034", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Catherine Harkin", createdate:"2026-08-26T16:01:41.398Z", stage:"app", amount:440 },
  { id:"518965897462", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for catherine Rowan", createdate:"2026-08-31T08:46:57.412Z", stage:"app", amount:440 },
  { id:"519168176329", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Samantha Sullivan", createdate:"2026-09-01T19:51:49.827Z", stage:"app", amount:440 },
  { id:"519826685135", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Erin Murray", createdate:"2026-09-04T16:02:44.610Z", stage:"app", amount:295 },
  { id:"519942681805", dealname:"Cleanpass (Level 3) - Classroom Near You (3N0574 CNY DCP) - Mullingar for  ", createdate:"2026-09-05T16:35:09.299Z", stage:"app", amount:0 },
  { id:"519926969558", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ava McMahon", createdate:"2026-09-06T17:34:06.449Z", stage:"app", amount:440 },
  { id:"520159699146", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Mary Clifford", createdate:"2026-09-07T09:33:59.905Z", stage:"app", amount:440 },
  { id:"510159345860", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Emma O'Neill", createdate:"2026-07-14T22:21:25.012Z", stage:"won", amount:440 },
  { id:"510207530216", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sharon Hickey", createdate:"2026-07-15T11:23:01.113Z", stage:"won", amount:440 },
  { id:"510461878467", dealname:"Barista training (1169 CNY DBU) - Mullingar for Emma Rose Boshuijer", createdate:"2026-07-16T14:11:40.682Z", stage:"won", amount:170 },
  { id:"510454800578", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Geraldine Moran", createdate:"2026-07-16T16:21:17.458Z", stage:"won", amount:440 },
  { id:"510578336982", dealname:"Barista training (1169 CNY DBU) - Mullingar for Deesathi Vidanage", createdate:"2026-07-17T09:44:56.324Z", stage:"won", amount:170 },
  { id:"510871314658", dealname:"Barista training (1169 CNY DBU) - Mullingar for Elizabeth Farrell", createdate:"2026-07-17T13:52:20.570Z", stage:"won", amount:170 },
  { id:"510976851172", dealname:"Barista training (1169 CNY DBU) - Mullingar for Sarah Keane", createdate:"2026-07-17T16:55:54.373Z", stage:"won", amount:170 },
  { id:"511235326158", dealname:"Barista training (1169 CNY DBU) - Mullingar for Ciara Finn", createdate:"2026-07-18T16:19:24.765Z", stage:"won", amount:170 },
  { id:"511128761593", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Donna Power", createdate:"2026-07-20T04:45:14.107Z", stage:"won", amount:295 },
  { id:"511298703576", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anna Gavigan", createdate:"2026-07-20T08:17:26.821Z", stage:"won", amount:440 },
  { id:"511748434162", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Snezhana Angelova", createdate:"2026-07-21T14:45:17.783Z", stage:"won", amount:440 },
  { id:"512217608397", dealname:"Anatomy and Physiology - Online Anytime 1:1 (5N0749 OA DHC) -  for Aigbe Sandra Liberty", createdate:"2026-07-22T19:16:42.620Z", stage:"won", amount:295 },
  { id:"512796773596", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Tanya Flynn", createdate:"2026-07-24T19:29:32.672Z", stage:"won", amount:295 },
  { id:"512813004013", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Rebecca Grant", createdate:"2026-07-24T22:11:52.936Z", stage:"won", amount:295 },
  { id:"512930477247", dealname:"Barista training (1169 CNY DBU) - Mullingar for Patricia Mcintyre", createdate:"2026-07-25T12:45:55.237Z", stage:"won", amount:170 },
  { id:"512952131782", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Santiago Mazzei", createdate:"2026-07-25T16:33:19.074Z", stage:"won", amount:295 },
  { id:"513367669951", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Michelle Healy", createdate:"2026-07-27T11:25:29.924Z", stage:"won", amount:440 },
  { id:"513760180424", dealname:"Communications (Healthcare) - Online Anytime 1:1 (5N0690 OA DHC) -  for Bernadette Bates", createdate:"2026-07-29T09:48:46.372Z", stage:"won", amount:295 },
  { id:"513809827003", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Aoife Brady", createdate:"2026-07-29T14:41:31.846Z", stage:"won", amount:440 },
  { id:"513995007213", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aoife Desmond", createdate:"2026-07-31T11:52:46.737Z", stage:"won", amount:440 },
  { id:"514315556034", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Chantel Kenny", createdate:"2026-07-31T17:35:07.735Z", stage:"won", amount:440 },
  { id:"514647626980", dealname:"Challenging Behaviour - Online Anytime 1:1 (5N1706 OA DSC) -  for Alona Trach", createdate:"2026-08-01T11:55:12.553Z", stage:"won", amount:380 },
  { id:"514669152498", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Marie O Shea", createdate:"2026-08-01T13:09:17.984Z", stage:"won", amount:440 },
  { id:"514487172322", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Shauna Quinn", createdate:"2026-08-01T14:09:53.891Z", stage:"won", amount:455 },
  { id:"514915505395", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Tara Lacken", createdate:"2026-08-03T14:54:11.801Z", stage:"won", amount:295 },
  { id:"515000555759", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Melanie Ludlow Roche", createdate:"2026-08-04T12:56:24.701Z", stage:"won", amount:440 },
  { id:"515032031451", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Vivien Parker", createdate:"2026-08-04T14:26:50.050Z", stage:"won", amount:295 },
  { id:"515101555957", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Michael Coughlan", createdate:"2026-08-05T11:15:18.776Z", stage:"won", amount:295 },
  { id:"515131712727", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Blueson Biju", createdate:"2026-08-05T16:11:46.900Z", stage:"won", amount:295 },
  { id:"515213477113", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Blueson Biju", createdate:"2026-08-05T16:29:49.917Z", stage:"won", amount:295 },
  { id:"515204935893", dealname:"Infection Prevention and Control - Online Anytime 1:1 (5N3734 OA DHC) -  for Professor Magarai", createdate:"2026-08-05T19:38:18.646Z", stage:"won", amount:295 },
  { id:"515167935704", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for  ", createdate:"2026-08-06T09:43:33.690Z", stage:"won", amount:440 },
  { id:"515277684977", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Ailish Harkin", createdate:"2026-08-07T10:26:16.483Z", stage:"won", amount:440 },
  { id:"515607220467", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Niamh Culleton", createdate:"2026-08-10T13:28:48.399Z", stage:"won", amount:455 },
  { id:"515738416347", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Thays Dutra", createdate:"2026-08-10T21:34:16.419Z", stage:"won", amount:295 },
  { id:"515811014871", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Lucy Cassidy", createdate:"2026-08-10T23:33:34.830Z", stage:"won", amount:440 },
  { id:"515773116633", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Cecilia scanlon", createdate:"2026-08-11T09:09:37.238Z", stage:"won", amount:455 },
  { id:"515757313224", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Sandra O'Brien", createdate:"2026-08-11T12:12:35.925Z", stage:"won", amount:440 },
  { id:"516056595685", dealname:"Cardiac First Response Community (CFRC CNY DHP) - Mullingar for Scott Hyland", createdate:"2026-08-11T17:35:15.699Z", stage:"won", amount:170 },
  { id:"516116139200", dealname:"Barista training (1169 CNY DBU) - Mullingar for André Marx", createdate:"2026-08-12T05:33:27.479Z", stage:"won", amount:170 },
  { id:"516260792538", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Patricia O Flynn O Donoghue", createdate:"2026-08-12T06:43:49.365Z", stage:"won", amount:440 },
  { id:"516384715977", dealname:"Barista training (1169 CNY DBU) - Mullingar for Naomi Wade", createdate:"2026-08-12T18:20:30.847Z", stage:"won", amount:170 },
  { id:"516447498487", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Valquiria Santos Baptista", createdate:"2026-08-12T19:29:25.021Z", stage:"won", amount:295 },
  { id:"516467687613", dealname:"Barista training (1169 CNY DBU) - Mullingar for Beth Atli", createdate:"2026-08-12T21:03:52.804Z", stage:"won", amount:170 },
  { id:"516514982129", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Zak Breen", createdate:"2026-08-13T01:01:04.685Z", stage:"won", amount:440 },
  { id:"516762553582", dealname:"Barista training (1169 CNY DBU) - Mullingar for Christopher Bookless", createdate:"2026-08-14T08:26:35.714Z", stage:"won", amount:170 },
  { id:"516700067018", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Gillian Cooney", createdate:"2026-08-14T08:33:12.562Z", stage:"won", amount:440 },
  { id:"516759207118", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Joanne Strydom", createdate:"2026-08-14T12:21:26.615Z", stage:"won", amount:295 },
  { id:"516726169799", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Ciaran Monaghan", createdate:"2026-08-14T12:49:06.539Z", stage:"won", amount:170 },
  { id:"516796157126", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Anna Johnston", createdate:"2026-08-14T12:58:38.267Z", stage:"won", amount:170 },
  { id:"516738816235", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Stephen Cranley", createdate:"2026-08-14T13:20:36.324Z", stage:"won", amount:295 },
  { id:"516733606080", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Saoirse OHagan", createdate:"2026-08-14T16:57:33.476Z", stage:"won", amount:295 },
  { id:"516961304824", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Catherine Gogan", createdate:"2026-08-15T10:33:28.766Z", stage:"won", amount:295 },
  { id:"516905756913", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Anna Shaw Luby", createdate:"2026-08-15T17:58:51.911Z", stage:"won", amount:170 },
  { id:"516984967378", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Eimear Dykes", createdate:"2026-08-16T15:04:39.877Z", stage:"won", amount:440 },
  { id:"517063805149", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Chloe Bannon", createdate:"2026-08-16T20:32:46.256Z", stage:"won", amount:170 },
  { id:"517006829805", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Zoe ", createdate:"2026-08-17T09:13:24.875Z", stage:"won", amount:170 },
  { id:"517100287178", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Deirdre Murray", createdate:"2026-08-17T11:05:27.367Z", stage:"won", amount:440 },
  { id:"517328967893", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Bray for Alison Boyce", createdate:"2026-08-17T21:30:15.402Z", stage:"won", amount:440 },
  { id:"517431791844", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Amanda Hackett", createdate:"2026-08-18T14:09:57.976Z", stage:"won", amount:295 },
  { id:"517464509650", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Donna Kelly", createdate:"2026-08-18T20:05:02.960Z", stage:"won", amount:295 },
  { id:"517432909002", dealname:"Psychology - Online Anytime 1:1 (5N0754 OA DHC) -  for Virginia Heneghan", createdate:"2026-08-19T14:01:40.332Z", stage:"won", amount:295 },
  { id:"517467616448", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sam Crawford", createdate:"2026-08-19T14:31:29.421Z", stage:"won", amount:440 },
  { id:"517595211977", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Grainne Faulkner", createdate:"2026-08-19T16:39:05.951Z", stage:"won", amount:440 },
  { id:"517637959914", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Jack Moore", createdate:"2026-08-19T21:38:51.883Z", stage:"won", amount:295 },
  { id:"517593017538", dealname:"Nutrition - Online Anytime 1:1 (5N2006 OA DHC) -  for Niamh Kelly", createdate:"2026-08-20T04:22:52.165Z", stage:"won", amount:295 },
  { id:"517581720803", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Claire Neely", createdate:"2026-08-20T10:19:14.492Z", stage:"won", amount:440 },
  { id:"517673131195", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Keifa  Hopkins", createdate:"2026-08-20T12:29:30.247Z", stage:"won", amount:440 },
  { id:"517735953630", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Richard Dee", createdate:"2026-08-21T08:54:48.835Z", stage:"won", amount:440 },
  { id:"517738401998", dealname:"Anatomy and Physiology - Online Anytime 1:1 (5N0749 OA DHC) -  for Sarah O'Connor", createdate:"2026-08-21T10:03:54.301Z", stage:"won", amount:295 },
  { id:"517714877628", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Edel Cassidy", createdate:"2026-08-21T12:28:58.261Z", stage:"won", amount:440 },
  { id:"518362045664", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aimee Slattery", createdate:"2026-08-26T07:04:11.528Z", stage:"won", amount:440 },
  { id:"518378645711", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Fern Bohill", createdate:"2026-08-26T08:37:35.113Z", stage:"won", amount:440 },
  { id:"518415504601", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for  ", createdate:"2026-08-26T11:00:14.788Z", stage:"won", amount:440 },
  { id:"518384438488", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rebecca Gibney Armstrong", createdate:"2026-08-26T19:01:06.343Z", stage:"won", amount:440 },
  { id:"518453047519", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Eireann Tierney", createdate:"2026-08-27T10:15:23.415Z", stage:"won", amount:440 },
  { id:"518388778189", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Emily Hanratty", createdate:"2026-08-27T10:34:24.613Z", stage:"won", amount:440 },
  { id:"518614695136", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lauren Devine", createdate:"2026-08-27T16:26:54.228Z", stage:"won", amount:440 },
  { id:"518634707167", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Vicky Connick", createdate:"2026-08-28T07:43:32.028Z", stage:"won", amount:440 },
  { id:"518653368506", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Tina Hagan", createdate:"2026-08-28T10:38:20.545Z", stage:"won", amount:440 },
  { id:"518795955404", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Kathleen Gallagher", createdate:"2026-08-28T15:58:23.340Z", stage:"won", amount:440 },
  { id:"518808712412", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Antoinette Walsh", createdate:"2026-08-28T22:10:42.880Z", stage:"won", amount:440 },
  { id:"518860627135", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Helena McGourty", createdate:"2026-08-29T07:47:16.022Z", stage:"won", amount:440 },
  { id:"518800065777", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for  ", createdate:"2026-08-29T08:39:32.575Z", stage:"won", amount:295 },
  { id:"518827988171", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Catherina O'Shea", createdate:"2026-08-30T13:10:45.154Z", stage:"won", amount:440 },
  { id:"518829774031", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Kate Farrell", createdate:"2026-08-30T14:07:48.514Z", stage:"won", amount:295 },
  { id:"518925493485", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Catherine Carney", createdate:"2026-08-30T22:31:42.666Z", stage:"won", amount:295 },
  { id:"519024515259", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Claire Carr", createdate:"2026-08-31T10:40:14.296Z", stage:"won", amount:440 },
  { id:"518962980037", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Kathleen O'Sullivan", createdate:"2026-08-31T11:48:13.321Z", stage:"won", amount:440 },
  { id:"519222464744", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athenry for Aleisha Kinneen", createdate:"2026-09-01T08:18:44.249Z", stage:"won", amount:440 },
  { id:"519169155294", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Ellen O Connell", createdate:"2026-09-01T08:39:48.030Z", stage:"won", amount:295 },
  { id:"519086021854", dealname:"Supervisory Management - Online Anytime 1:1 (6N4329 OA DBU) -  for Niamh Byrne", createdate:"2026-09-01T09:45:08.204Z", stage:"won", amount:380 },
  { id:"519219515582", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aodhdin Twomey", createdate:"2026-09-01T10:06:53.674Z", stage:"won", amount:440 },
  { id:"519128158455", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Gilmartin Sarah", createdate:"2026-09-01T11:31:57.671Z", stage:"won", amount:440 },
  { id:"519133316308", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Samantha Sykes", createdate:"2026-09-01T12:37:44.093Z", stage:"won", amount:440 },
  { id:"519126462702", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Catherine Briody", createdate:"2026-09-01T17:46:03.990Z", stage:"won", amount:440 },
  { id:"519089915125", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Gemma Gooney", createdate:"2026-09-01T17:49:51.001Z", stage:"won", amount:440 },
  { id:"519271965916", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Drogheda for Gillian Clarkin", createdate:"2026-09-01T19:54:26.377Z", stage:"won", amount:440 },
  { id:"519291112658", dealname:"Applied Behavioural Analysis - Online Anytime 1:1 (5N1729 OA DSC) -  for Laura Weston Ruddy", createdate:"2026-09-01T20:53:16.221Z", stage:"won", amount:425 },
  { id:"519288952013", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Joseph Ganley", createdate:"2026-09-01T22:36:57.219Z", stage:"won", amount:295 },
  { id:"519317122284", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Allexia Roca", createdate:"2026-09-02T08:37:09.879Z", stage:"won", amount:440 },
  { id:"519318035678", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Lisa Wyles", createdate:"2026-09-02T09:38:25.804Z", stage:"won", amount:440 },
  { id:"519336692949", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Josephine Carolan", createdate:"2026-09-02T10:42:07.054Z", stage:"won", amount:455 },
  { id:"519470162111", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for sandra barry", createdate:"2026-09-02T17:03:19.625Z", stage:"won", amount:295 },
  { id:"519403287784", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Lynagh Lynagh", createdate:"2026-09-02T17:22:25.560Z", stage:"won", amount:440 },
  { id:"519527208141", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Eileen Rowland", createdate:"2026-09-02T21:49:38.958Z", stage:"won", amount:295 },
  { id:"519499093204", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Atlanta Lynch Lonican", createdate:"2026-09-03T07:32:02.912Z", stage:"won", amount:170 },
  { id:"519509742789", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Theresa Kiely", createdate:"2026-09-03T10:41:33.930Z", stage:"won", amount:295 },
  { id:"519405898976", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Yvonne Rountree", createdate:"2026-09-03T11:26:30.287Z", stage:"won", amount:295 },
  { id:"519688084728", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Castlebar for Aisling Bhreathnach", createdate:"2026-09-03T18:40:45.327Z", stage:"won", amount:440 },
  { id:"519829954803", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Graciele Maria Ludwig", createdate:"2026-09-04T09:42:43.523Z", stage:"won", amount:295 },
  { id:"519835534542", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Inga Venckute", createdate:"2026-09-04T12:00:06.432Z", stage:"won", amount:440 },
  { id:"519824945371", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for SAMANTHA KANE", createdate:"2026-09-04T16:24:29.656Z", stage:"won", amount:440 },
  { id:"519904102607", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Grainne Martin", createdate:"2026-09-04T20:43:40.492Z", stage:"won", amount:440 },
  { id:"519871519974", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for madison diver", createdate:"2026-09-04T21:04:06.575Z", stage:"won", amount:440 },
  { id:"519963669717", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Leah Baskin", createdate:"2026-09-04T22:49:53.290Z", stage:"won", amount:440 },
  { id:"519954953460", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Carmen Cash", createdate:"2026-09-05T07:33:13.960Z", stage:"won", amount:170 },
  { id:"519957032156", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for yvonne Guilfoyle", createdate:"2026-09-05T18:01:47.933Z", stage:"won", amount:440 },
  { id:"519908832463", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Susan Mooney", createdate:"2026-09-06T08:39:35.751Z", stage:"won", amount:295 },
  { id:"519941513443", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Caoímhe Bond", createdate:"2026-09-06T13:08:01.311Z", stage:"won", amount:440 },
  { id:"520104261876", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Sinead Hourihane", createdate:"2026-09-06T17:37:07.128Z", stage:"won", amount:440 },
  { id:"520008756443", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Alysha Murphy", createdate:"2026-09-06T19:00:17.812Z", stage:"won", amount:440 },
  { id:"520097732830", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Ethna Killeen", createdate:"2026-09-06T19:08:46.825Z", stage:"won", amount:440 },
  { id:"520002407629", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Michelle Dolan", createdate:"2026-09-06T19:43:00.170Z", stage:"won", amount:440 },
  { id:"519966953676", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Aileen Hanley", createdate:"2026-09-06T21:25:09.961Z", stage:"won", amount:440 },
  { id:"520159599834", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Paula McCarthy", createdate:"2026-09-07T09:20:11.145Z", stage:"won", amount:440 },
  { id:"520169925818", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Enniscorthy for Lorraine Lozano", createdate:"2026-09-07T11:28:59.211Z", stage:"won", amount:440 },
  { id:"520172771569", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Bernadette Mahon", createdate:"2026-09-07T12:20:53.788Z", stage:"won", amount:295 },
  { id:"520221726929", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Philip Doherty", createdate:"2026-09-07T17:25:41.838Z", stage:"won", amount:440 },
  { id:"520331276489", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sue Ward", createdate:"2026-09-07T19:20:14.462Z", stage:"won", amount:440 },
  { id:"520380804316", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Katie Tunney", createdate:"2026-09-07T20:49:26.168Z", stage:"won", amount:440 },
  { id:"520382666965", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Evelyn Booth", createdate:"2026-09-07T22:12:40.272Z", stage:"won", amount:295 },
  { id:"520437062842", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Robert Marry", createdate:"2026-09-08T11:27:00.522Z", stage:"won", amount:440 },
];

// ─── PARSING ─────────────────────────────────────────────────────────────────
const DEPT_MAP   = { DSN:"SNA", DHC:"Healthcare", DSC:"Social Care", DBU:"Business", ELC:"ELC" };
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
  { wk:"W1", label:"13 Jul–19 Jul",      start:new Date("2026-07-12T23:00:00Z"), end:new Date("2026-07-19T22:59:59Z"), full:true  },
  { wk:"W2", label:"20 Jul–26 Jul",      start:new Date("2026-07-19T23:00:00Z"), end:new Date("2026-07-26T22:59:59Z"), full:true  },
  { wk:"W3", label:"27 Jul–2 Aug",       start:new Date("2026-07-26T23:00:00Z"), end:new Date("2026-08-02T22:59:59Z"), full:true  },
  { wk:"W4", label:"3 Aug–9 Aug",        start:new Date("2026-08-02T23:00:00Z"), end:new Date("2026-08-09T22:59:59Z"), full:true  },
  { wk:"W5", label:"10 Aug–16 Aug",      start:new Date("2026-08-09T23:00:00Z"), end:new Date("2026-08-16T22:59:59Z"), full:true  },
  { wk:"W6", label:"17 Aug–23 Aug",      start:new Date("2026-08-16T23:00:00Z"), end:new Date("2026-08-23T22:59:59Z"), full:true  },
  { wk:"W7", label:"24 Aug–30 Aug",      start:new Date("2026-08-23T23:00:00Z"), end:new Date("2026-08-30T22:59:59Z"), full:true  },
  { wk:"W8", label:"31 Aug–6 Sep",       start:new Date("2026-08-30T23:00:00Z"), end:new Date("2026-09-06T22:59:59Z"), full:true  },
  { wk:"W9", label:"7 Sep–8 Sep ⚡", start:new Date("2026-09-06T23:00:00Z"), end:new Date("2026-09-08T12:06:29Z"), full:false },
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
          13 Jul – 8 Sep 2026 · deal create date · ⚡ W9 partial week
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
        Data: HubSpot B2C (Single Modules) pipeline · fetched 8 Sep 2026 · deal create date as week anchor
      </p>
    </div>
  );
}
