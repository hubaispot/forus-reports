import { useState, useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ─── RAW DEAL DATA (fetched 12 Nov 2026) ─────────────────────────────────────
// Window: W1 14 Sep – W9 12 Nov 2026 (8 full weeks + W9 partial). 562 deals fetched + 7 graduated; 498 kept.
// 12 Nov run: W9 dup removed — 538532759740 Aisling Maguire Payroll TP app (keep latest 539900912861).
//   Blank-name W9 app 538274380024 (Entrepreneurial Skills) kept, consistent with prior blank-name deals.
// Excluded: 64 same-person/same-course duplicates (keep latest; SP+TP treated as one app pool;
//   delivery switches OA/LO/CNY = same course; name-variant merges: Orla McGlynn/Mc glynn,
//   Susan Lynch(-Concannon), M/Maria Teresa Merino). Junk: 521580193014 "xx Xxc", 522157212919 "Danielle",
//   523496451299 "lisa", 525436219610 "paula", 526106417382 "Maureen", 526432037083 "Melissa" (no course, €0).
// Closed Lost DND (756357057), excluded: 9 apps whose person has a Won deal on the same module
//   (Ciara Foy, Nobin Sabu, James Rutledge, Niamh mc donagh, Fionn Mc Grath, Pinkie Shabalala Comms,
//   Hilary Sheridan, Malilemo Thakali, Lydia Rodgers).
// Graduated (pipeline 110199236): 7 kept at last-known B2C stage (2 app, 5 won); 4 now Closed Lost NMC excluded
//   (523066873026 Abhiroop Bhattacharya app, 524343733452 Collette Mc Closkey, 525329850558 Michaela Donovan,
//   525257460976 Seana Mc Daid won €440).
//   5 Barista won deals with null amount overridden to €170. DHO (Horticulture) mapped to Other.
// Stages: 5381718219 + 5381718220 = Application received | 756357056 = Won
const RAW_DEALS = [
  { id:"521498795229", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Vida Lescinskiene", createdate:"2026-09-14T08:38:38Z", stage:"app", amount:0 },
  { id:"521509243068", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for James Coughlin", createdate:"2026-09-14T10:35:03Z", stage:"app", amount:440 },
  { id:"521522248890", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Jenny kehoe", createdate:"2026-09-14T11:24:25Z", stage:"app", amount:440 },
  { id:"521516750054", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Vida Lescinskiene", createdate:"2026-09-14T12:02:02Z", stage:"won", amount:170 },
  { id:"521517229289", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Ellie Costelloe", createdate:"2026-09-14T12:31:23Z", stage:"app", amount:440 },
  { id:"521423692002", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Ellie Costelloe", createdate:"2026-09-14T12:40:05Z", stage:"won", amount:440 },
  { id:"521523625169", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Kayleigh Griffin", createdate:"2026-09-14T13:00:09Z", stage:"app", amount:440 },
  { id:"521518928061", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Jennifer Fidgeon", createdate:"2026-09-14T13:09:50Z", stage:"app", amount:0 },
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
  { id:"521587867853", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Amy Gaffney", createdate:"2026-09-15T11:16:18Z", stage:"app", amount:440 },
  { id:"521591534822", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ashbourne for Bhawna Kumar", createdate:"2026-09-15T11:33:27Z", stage:"app", amount:440 },
  { id:"521589157078", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Ella Durkan", createdate:"2026-09-15T12:23:51Z", stage:"won", amount:455 },
  { id:"521589928151", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Michelle O Connor", createdate:"2026-09-15T12:49:12Z", stage:"app", amount:440 },
  { id:"521594259671", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Tina Morrissey", createdate:"2026-09-15T13:10:49Z", stage:"app", amount:440 },
  { id:"521595145408", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Zoe tate", createdate:"2026-09-15T13:31:38Z", stage:"app", amount:440 },
  { id:"521600466155", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Tricia Jones", createdate:"2026-09-15T14:49:53Z", stage:"app", amount:440 },
  { id:"521609025723", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Michelle Saluta", createdate:"2026-09-15T19:01:03Z", stage:"app", amount:440 },
  { id:"521612732659", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Kathrine English", createdate:"2026-09-15T20:00:55Z", stage:"app", amount:455 },
  { id:"521610611919", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Shona Poland", createdate:"2026-09-15T21:02:24Z", stage:"app", amount:440 },
  { id:"521620584645", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Niall Williams", createdate:"2026-09-15T21:58:01Z", stage:"won", amount:170 },
  { id:"521615972597", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Athy for Laura O'Neill", createdate:"2026-09-15T23:33:16Z", stage:"app", amount:440 },
  { id:"521648785643", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Caitriona Byrne", createdate:"2026-09-16T09:59:06Z", stage:"won", amount:440 },
  { id:"521654567119", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Eva Casey", createdate:"2026-09-16T10:25:58Z", stage:"app", amount:440 },
  { id:"521659359464", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for  ", createdate:"2026-09-16T11:53:33Z", stage:"app", amount:455 },
  { id:"521662632143", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Shane Lynch", createdate:"2026-09-16T12:45:39Z", stage:"app", amount:0 },
  { id:"521664247007", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Ciara Luby", createdate:"2026-09-16T13:18:26Z", stage:"app", amount:440 },
  { id:"521664617700", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Clodagh Tighe", createdate:"2026-09-16T13:23:47Z", stage:"won", amount:440 },
  { id:"521664936145", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Ciara Luby", createdate:"2026-09-16T13:29:10Z", stage:"won", amount:440 },
  { id:"521679800569", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Cavan for Nikita Kennedy", createdate:"2026-09-16T14:16:46Z", stage:"won", amount:440 },
  { id:"521690180843", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for Kate Nwaka", createdate:"2026-09-16T14:43:36Z", stage:"won", amount:309.75 },
  { id:"521677239493", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Kirsty Murphy", createdate:"2026-09-16T15:22:58Z", stage:"won", amount:440 },
  { id:"521696207078", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Adnaan Mohamed Abdi", createdate:"2026-09-16T15:50:25Z", stage:"won", amount:309.75 },
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
  { id:"521723774170", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Murtagh O’Connor", createdate:"2026-09-17T16:49:22Z", stage:"won", amount:440 },
  { id:"521831085298", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Karen Hannigan", createdate:"2026-09-17T18:54:13Z", stage:"app", amount:440 },
  { id:"521821492435", dealname:"Challenging Behaviour - Online Anytime 1:1 (5N1706 OA DSC) -  for Glendon Anderson", createdate:"2026-09-17T19:22:13Z", stage:"app", amount:380 },
  { id:"521821504707", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Birr for Joseph King", createdate:"2026-09-17T19:40:54Z", stage:"app", amount:440 },
  { id:"521836445927", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Noelle Donnelly", createdate:"2026-09-17T19:44:55Z", stage:"won", amount:440 },
  { id:"521836486877", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Trudy Walsh", createdate:"2026-09-17T20:28:15Z", stage:"won", amount:440 },
  { id:"521817132237", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lisa Breeze", createdate:"2026-09-17T21:01:02Z", stage:"app", amount:440 },
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
  { id:"522030946525", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Radmyla Mytelska", createdate:"2026-09-19T12:19:20Z", stage:"won", amount:170 },
  { id:"522034479336", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Lorraine Kelly", createdate:"2026-09-19T14:03:14Z", stage:"app", amount:440 },
  { id:"521991893193", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Alison Dowling", createdate:"2026-09-19T15:24:16Z", stage:"app", amount:440 },
  { id:"522037950656", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Danielle Mc daid", createdate:"2026-09-19T17:16:23Z", stage:"app", amount:440 },
  { id:"522057576689", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for sarah o reilly", createdate:"2026-09-19T20:23:01Z", stage:"app", amount:440 },
  { id:"522035634425", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Noeleen Byrne", createdate:"2026-09-20T07:18:05Z", stage:"won", amount:440 },
  { id:"522120918235", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Clodagh Sheahan", createdate:"2026-09-20T14:18:58Z", stage:"won", amount:440 },
  { id:"522139921611", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Nobin Sabu", createdate:"2026-09-20T19:47:47Z", stage:"won", amount:309.75 },
  { id:"522167200981", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Natasha Culhane", createdate:"2026-09-21T08:50:42Z", stage:"app", amount:295 },
  { id:"522194298089", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Tara Murray", createdate:"2026-09-21T09:57:16Z", stage:"app", amount:455 },
  { id:"522181351632", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Ciaran O Connell", createdate:"2026-09-21T10:31:12Z", stage:"app", amount:440 },
  { id:"522194167015", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Ciaran O Connell", createdate:"2026-09-21T10:35:21Z", stage:"won", amount:440 },
  { id:"522197021922", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Ciara Foy", createdate:"2026-09-21T11:21:17Z", stage:"won", amount:295 },
  { id:"522100012238", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aoife O' Gorman", createdate:"2026-09-21T11:26:21Z", stage:"won", amount:440 },
  { id:"522198819047", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Tricia Jones", createdate:"2026-09-21T12:40:48Z", stage:"won", amount:440 },
  { id:"522191331553", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mallow for Kayleigh Collins", createdate:"2026-09-21T13:24:57Z", stage:"app", amount:440 },
  { id:"522161864898", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for sandra loughlin", createdate:"2026-09-21T16:29:30Z", stage:"app", amount:440 },
  { id:"522217363677", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for sandra loughlin", createdate:"2026-09-21T16:32:18Z", stage:"won", amount:440 },
  { id:"522215227621", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Amy Gahan", createdate:"2026-09-21T17:29:48Z", stage:"app", amount:440 },
  { id:"522166115541", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Nessa Hart", createdate:"2026-09-21T18:47:16Z", stage:"app", amount:295 },
  { id:"522186438878", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Anab hassan Ibrahim", createdate:"2026-09-21T19:01:54Z", stage:"app", amount:295 },
  { id:"522267698391", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sheila Cordonnier", createdate:"2026-09-21T22:03:10Z", stage:"won", amount:440 },
  { id:"522336548057", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Amy Gahan", createdate:"2026-09-22T06:17:29Z", stage:"won", amount:440 },
  { id:"522350850237", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Adam Carey", createdate:"2026-09-22T10:18:59Z", stage:"app", amount:440 },
  { id:"522282781900", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Brenda Leahy", createdate:"2026-09-22T10:37:02Z", stage:"app", amount:440 },
  { id:"522273990896", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Nicole Myles", createdate:"2026-09-22T13:51:15Z", stage:"app", amount:440 },
  { id:"522265086177", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Angela Pocius", createdate:"2026-09-22T14:38:40Z", stage:"app", amount:440 },
  { id:"522353015004", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Myself and Married", createdate:"2026-09-22T18:03:48Z", stage:"app", amount:440 },
  { id:"522272493766", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Izabela Bilinska", createdate:"2026-09-22T18:11:07Z", stage:"app", amount:440 },
  { id:"522381475034", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Orla Mc glynn", createdate:"2026-09-22T19:58:42Z", stage:"app", amount:440 },
  { id:"522326679763", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aoife Mcfadden", createdate:"2026-09-22T21:26:39Z", stage:"app", amount:440 },
  { id:"522317776080", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for Rachel Walsh", createdate:"2026-09-22T22:22:51Z", stage:"app", amount:440 },
  { id:"522254932157", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Danielle Kerr", createdate:"2026-09-22T22:27:28Z", stage:"won", amount:440 },
  { id:"522405237969", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mallow for Ava Crowley", createdate:"2026-09-23T09:14:20Z", stage:"app", amount:440 },
  { id:"522480923881", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Emma Kehoe", createdate:"2026-09-23T09:46:52Z", stage:"won", amount:440 },
  { id:"522526030012", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Michelle Mc donnell", createdate:"2026-09-23T13:22:30Z", stage:"won", amount:440 },
  { id:"522530983153", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Amanda Mc cafferty", createdate:"2026-09-23T13:36:11Z", stage:"app", amount:440 },
  { id:"522535677174", dealname:"Retail Selling - Online Anytime 1:1 (5N1619 OA DBU) -  for Melissa Hogan", createdate:"2026-09-23T13:56:44Z", stage:"app", amount:295 },
  { id:"522606231791", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Danielle Kelly", createdate:"2026-09-23T14:28:13Z", stage:"app", amount:440 },
  { id:"522569965790", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Fredy Melendez", createdate:"2026-09-23T16:09:11Z", stage:"app", amount:295 },
  { id:"522568581346", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Lauren Ward", createdate:"2026-09-23T19:56:43Z", stage:"app", amount:440 },
  { id:"522544072895", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Jenny kehoe", createdate:"2026-09-23T22:38:17Z", stage:"won", amount:440 },
  { id:"522546201839", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ayah Alswalmah", createdate:"2026-09-24T04:36:25Z", stage:"app", amount:440 },
  { id:"522770025696", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Ellen Parr🤍", createdate:"2026-09-24T04:41:27Z", stage:"app", amount:295 },
  { id:"522645172422", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for Mary Madden", createdate:"2026-09-24T06:50:38Z", stage:"won", amount:309.75 },
  { id:"522605892812", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Barbara Gunn", createdate:"2026-09-24T07:33:20Z", stage:"app", amount:440 },
  { id:"522594788538", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Michaela Pace", createdate:"2026-09-24T08:09:15Z", stage:"app", amount:440 },
  { id:"522754057407", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Eileen Gregan", createdate:"2026-09-24T08:31:47Z", stage:"app", amount:440 },
  { id:"522578708671", dealname:"Business Management - Online Anytime 1:1 (6N4310 OA DBU) -  for Helio Cavalcanti", createdate:"2026-09-24T09:47:28Z", stage:"app", amount:380 },
  { id:"522775384257", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Michaela Pace", createdate:"2026-09-24T10:39:21Z", stage:"won", amount:440 },
  { id:"522759362753", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Amy🤍 Bell", createdate:"2026-09-24T12:13:19Z", stage:"app", amount:440 },
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
  { id:"522862244057", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Bray for Sinead Hennessy", createdate:"2026-09-24T19:36:14Z", stage:"app", amount:440 },
  { id:"522878230725", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Oksana Guzieieva", createdate:"2026-09-24T20:03:24Z", stage:"app", amount:455 },
  { id:"522878071005", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Annalise Doran", createdate:"2026-09-24T20:54:08Z", stage:"app", amount:440 },
  { id:"522844709111", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Pauline Doogan", createdate:"2026-09-24T21:07:03Z", stage:"app", amount:440 },
  { id:"522888105198", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Sally Billing", createdate:"2026-09-25T05:01:51Z", stage:"app", amount:440 },
  { id:"522916739272", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Niamh Killerlane", createdate:"2026-09-25T07:49:39Z", stage:"app", amount:440 },
  { id:"522922736885", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killorglin for Adam Carey", createdate:"2026-09-25T10:28:12Z", stage:"won", amount:440 },
  { id:"522941821167", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Maria Fahey", createdate:"2026-09-25T14:07:41Z", stage:"won", amount:295 },
  { id:"522942185719", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Aisling Mullarkey Sweeney", createdate:"2026-09-25T15:51:05Z", stage:"app", amount:440 },
  { id:"522966641903", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Danielle O Donnell", createdate:"2026-09-25T16:24:30Z", stage:"app", amount:440 },
  { id:"522969541832", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Kaysha Murray", createdate:"2026-09-25T19:23:58Z", stage:"won", amount:440 },
  { id:"522969807054", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Sarah O Regan O Flynn", createdate:"2026-09-25T19:29:24Z", stage:"won", amount:455 },
  { id:"522969997514", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Miriam O' Donovan", createdate:"2026-09-25T20:14:56Z", stage:"app", amount:440 },
  { id:"522975202542", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Paul O sullivan", createdate:"2026-09-25T21:14:26Z", stage:"app", amount:440 },
  { id:"522971170012", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Judith Xoliswa Louw", createdate:"2026-09-25T21:40:03Z", stage:"app", amount:440 },
  { id:"522975894764", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Drogheda for Gillian Johnson", createdate:"2026-09-25T21:57:13Z", stage:"app", amount:440 },
  { id:"522942807235", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Drogheda for Hannah Jones", createdate:"2026-09-26T07:19:32Z", stage:"app", amount:440 },
  { id:"523020570854", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Kathryn Boyle", createdate:"2026-09-26T08:00:42Z", stage:"app", amount:440 },
  { id:"523007475944", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Irtaza Umair", createdate:"2026-09-26T08:16:26Z", stage:"won", amount:295 },
  { id:"523061956796", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Portlaoise for Moran Lynn", createdate:"2026-09-27T09:58:58Z", stage:"app", amount:440 },
  { id:"523085212921", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Ryan Mc Gee", createdate:"2026-09-27T15:25:46Z", stage:"won", amount:440 },
  { id:"523097259220", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Liam Carroll", createdate:"2026-09-27T17:57:56Z", stage:"app", amount:440 },
  { id:"523097460947", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Aileen Cashman", createdate:"2026-09-27T18:05:54Z", stage:"app", amount:440 },
  { id:"523090948332", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Sharon O'Mahony", createdate:"2026-09-27T18:41:02Z", stage:"app", amount:440 },
  { id:"523097862371", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Moses Kigonya", createdate:"2026-09-27T18:56:12Z", stage:"won", amount:440 },
  { id:"523050974423", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Margaret Naughton", createdate:"2026-09-27T19:43:57Z", stage:"app", amount:440 },
  { id:"523070791910", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Renato Jose Soares Costa", createdate:"2026-09-27T20:14:15Z", stage:"app", amount:295 },
  { id:"523072246992", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Abigail Halley", createdate:"2026-09-27T21:56:05Z", stage:"app", amount:440 },
  { id:"523113047279", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for Deirdre Treacy", createdate:"2026-09-27T22:15:27Z", stage:"app", amount:440 },
  { id:"523104663777", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Emma Brennan", createdate:"2026-09-27T23:48:32Z", stage:"app", amount:440 },
  { id:"523014734067", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Marian Hayes", createdate:"2026-09-28T06:40:50Z", stage:"app", amount:440 },
  { id:"523123891399", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Marian Hayes", createdate:"2026-09-28T07:52:46Z", stage:"won", amount:440 },
  { id:"523055207655", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Orla Maybury", createdate:"2026-09-28T08:30:44Z", stage:"app", amount:440 },
  { id:"523140856047", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Eamon Willis", createdate:"2026-09-28T09:00:35Z", stage:"won", amount:440 },
  { id:"523157293256", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Kim Oneill", createdate:"2026-09-28T09:08:10Z", stage:"won", amount:440 },
  { id:"523141140713", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Rebecca Wyllie", createdate:"2026-09-28T09:15:28Z", stage:"won", amount:440 },
  { id:"523141619900", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Abhiroop Bhattacharya", createdate:"2026-09-28T09:40:47Z", stage:"won", amount:440 },
  { id:"523172114681", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Leanne Wall", createdate:"2026-09-28T12:40:22Z", stage:"app", amount:440 },
  { id:"523177390322", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Christine Naughton", createdate:"2026-09-28T14:24:47Z", stage:"app", amount:440 },
  { id:"523409480943", dealname:"Palliative Care Support - Online Anytime 1:1 (5N3769 OA DHC) -  for Paula ", createdate:"2026-09-28T16:41:13Z", stage:"won", amount:295 },
  { id:"523365958847", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Christine Naughton", createdate:"2026-09-28T17:41:20Z", stage:"won", amount:440 },
  { id:"523364162777", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dungloe for Sean Hyland", createdate:"2026-09-28T17:43:12Z", stage:"won", amount:440 },
  { id:"523493602548", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Susan Lynch - Concannon", createdate:"2026-09-28T17:51:51Z", stage:"app", amount:440 },
  { id:"523380365508", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Evan Carroll", createdate:"2026-09-28T18:29:51Z", stage:"app", amount:440 },
  { id:"523490118904", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dunfanaghy for Dominic Carr", createdate:"2026-09-28T20:28:07Z", stage:"app", amount:440 },
  { id:"523339087057", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Lauren Ward", createdate:"2026-09-28T20:32:46Z", stage:"won", amount:440 },
  { id:"523413936367", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Deirdre Fitzpatrick", createdate:"2026-09-29T08:31:40Z", stage:"app", amount:455 },
  { id:"523332486367", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Carrie Byrne", createdate:"2026-09-29T08:33:47Z", stage:"won", amount:440 },
  { id:"523390086378", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Shaun Crossan", createdate:"2026-09-29T10:57:17Z", stage:"won", amount:440 },
  { id:"523562324191", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for M Teresa Merino", createdate:"2026-09-29T12:31:04Z", stage:"app", amount:440 },
  { id:"523564224722", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Sophie White", createdate:"2026-09-29T12:34:04Z", stage:"app", amount:440 },
  { id:"523423276235", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Esperanza Morales", createdate:"2026-09-29T13:27:57Z", stage:"app", amount:440 },
  { id:"523394005186", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for Becky Swift", createdate:"2026-09-29T13:41:04Z", stage:"app", amount:440 },
  { id:"523585783031", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Chloe Blake", createdate:"2026-09-29T14:07:06Z", stage:"app", amount:440 },
  { id:"523394080955", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Valerie Tumulty", createdate:"2026-09-29T14:38:20Z", stage:"app", amount:440 },
  { id:"523410603240", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Jade Griffin", createdate:"2026-09-29T15:23:15Z", stage:"app", amount:440 },
  { id:"523683330240", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Louise Keating", createdate:"2026-09-29T15:54:06Z", stage:"app", amount:295 },
  { id:"523844304069", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Leanne Wilmot", createdate:"2026-09-29T16:56:17Z", stage:"app", amount:440 },
  { id:"523800340681", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Rebecca Hanan", createdate:"2026-09-29T18:04:44Z", stage:"app", amount:440 },
  { id:"523873040583", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Assumpta Gunning", createdate:"2026-09-29T18:09:06Z", stage:"app", amount:440 },
  { id:"523759546578", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Agnieszka Drelichowska", createdate:"2026-09-29T18:51:13Z", stage:"app", amount:440 },
  { id:"523763141860", dealname:"Applied Behavioural Analysis - Online Anytime 1:1 (5N1729 OA DSC) -  for Agnieszka Drelichowska", createdate:"2026-09-29T19:08:24Z", stage:"app", amount:425 },
  { id:"523759576289", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Michelle O Sullivan", createdate:"2026-09-29T19:16:23Z", stage:"app", amount:440 },
  { id:"523874901205", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Irene Fernandez", createdate:"2026-09-29T19:57:13Z", stage:"app", amount:295 },
  { id:"524048897247", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Ellen Gaynor", createdate:"2026-09-29T20:51:58Z", stage:"app", amount:440 },
  { id:"524001443036", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Portlaoise for Stash Kavanagh", createdate:"2026-09-29T21:20:23Z", stage:"app", amount:440 },
  { id:"523939664089", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Saoirse Harrison", createdate:"2026-09-29T21:41:47Z", stage:"won", amount:440 },
  { id:"524014303439", dealname:"Social Studies - Online Anytime 1:1 (5N1370 OA DHC) -  for  ", createdate:"2026-09-30T06:56:28Z", stage:"app", amount:295 },
  { id:"524056901824", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for Elizabeth Kennedy", createdate:"2026-09-30T12:07:14Z", stage:"app", amount:440 },
  { id:"524034166992", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for Emma Hallissey", createdate:"2026-09-30T12:07:39Z", stage:"app", amount:440 },
  { id:"523909907644", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sarah Jane Kelledy", createdate:"2026-09-30T12:30:55Z", stage:"app", amount:440 },
  { id:"524151923908", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ardee for Majella Ohagan", createdate:"2026-09-30T16:07:56Z", stage:"app", amount:440 },
  { id:"524155650295", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for PETER TYNAN", createdate:"2026-09-30T17:23:46Z", stage:"app", amount:295 },
  { id:"524216973498", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - New Ross for Bridget Silvey", createdate:"2026-09-30T20:12:15Z", stage:"app", amount:440 },
  { id:"524146814184", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Julia Lawless", createdate:"2026-09-30T21:40:31Z", stage:"app", amount:440 },
  { id:"524136136925", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for aoife seery", createdate:"2026-10-01T00:14:41Z", stage:"app", amount:440 },
  { id:"524217393357", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for Laura Dowd", createdate:"2026-10-01T06:36:18Z", stage:"app", amount:440 },
  { id:"524107797701", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Sheena Lynch", createdate:"2026-10-01T11:34:50Z", stage:"app", amount:440 },
  { id:"524165678269", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Pauline Doogan", createdate:"2026-10-01T12:28:27Z", stage:"won", amount:440 },
  { id:"524164021442", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for  ", createdate:"2026-10-01T15:51:22Z", stage:"won", amount:440 },
  { id:"524373695709", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dunfanaghy for Rosemary Saville", createdate:"2026-10-01T16:07:15Z", stage:"app", amount:440 },
  { id:"524373698798", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for Priscilla O'Connor", createdate:"2026-10-01T16:12:56Z", stage:"app", amount:440 },
  { id:"524373714134", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Jackie Burke", createdate:"2026-10-01T16:35:11Z", stage:"app", amount:455 },
  { id:"524347931868", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Linda O Sullivan", createdate:"2026-10-01T21:44:08Z", stage:"app", amount:440 },
  { id:"524372663531", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for Paula Byrne", createdate:"2026-10-02T08:27:30Z", stage:"won", amount:440 },
  { id:"524402321626", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Edenderry for Lisa Coffey", createdate:"2026-10-02T08:31:38Z", stage:"won", amount:440 },
  { id:"524415864055", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Ayesha Usman", createdate:"2026-10-02T08:35:57Z", stage:"won", amount:440 },
  { id:"524374437104", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Linda O Sullivan", createdate:"2026-10-02T08:59:26Z", stage:"won", amount:440 },
  { id:"524403312841", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for ali dicker", createdate:"2026-10-02T09:51:17Z", stage:"won", amount:295 },
  { id:"524406036676", dealname:"Palliative Care Support - Online Anytime 1:1 (5N3769 OA DHC) -  for Sarah Matthews", createdate:"2026-10-02T11:01:12Z", stage:"app", amount:295 },
  { id:"524378824911", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Laura O'Brien", createdate:"2026-10-02T11:38:21Z", stage:"app", amount:440 },
  { id:"524425560300", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Margaret Smyth", createdate:"2026-10-02T12:39:41Z", stage:"app", amount:295 },
  { id:"524425884889", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for FIONN MC GRATH", createdate:"2026-10-02T12:43:28Z", stage:"won", amount:295 },
  { id:"524426496198", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Anne O’Shea", createdate:"2026-10-02T13:13:19Z", stage:"app", amount:440 },
  { id:"524412296424", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Laura O Brien", createdate:"2026-10-02T13:17:22Z", stage:"won", amount:440 },
  { id:"524425964775", dealname:"Supervisory Management - Online Anytime 1:1 (6N4329 OA DBU) -  for Niamh Doherty", createdate:"2026-10-02T13:32:06Z", stage:"app", amount:380 },
  { id:"524521872583", dealname:"Marketing Management - Online Anytime 1:1 (6N4188 OA DBU) -  for Amalita O donoghue", createdate:"2026-10-02T14:42:05Z", stage:"app", amount:380 },
  { id:"524492739798", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Margaret Smyth", createdate:"2026-10-02T15:02:14Z", stage:"won", amount:295 },
  { id:"524487295195", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dunfanaghy for Amelia Boyle", createdate:"2026-10-02T15:05:04Z", stage:"app", amount:440 },
  { id:"524563308777", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Brigid Ryan", createdate:"2026-10-02T16:18:17Z", stage:"app", amount:440 },
  { id:"524575578299", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Stephen Hegarty", createdate:"2026-10-02T17:21:34Z", stage:"app", amount:440 },
  { id:"524643101923", dealname:"Person Centred Focus to Disability - Online Anytime 1:1 (5N1728 OA DSC) -  for Claris Katsande", createdate:"2026-10-03T08:24:33Z", stage:"app", amount:295 },
  { id:"524557061354", dealname:"Person Centred Focus to Disability - Online Anytime 1:1 (5N1728 OA DSC) -  for Claris Katsande", createdate:"2026-10-03T08:48:46Z", stage:"won", amount:295 },
  { id:"524546347246", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dunfanaghy for Shane Gallagher", createdate:"2026-10-03T09:07:23Z", stage:"app", amount:440 },
  { id:"524546592987", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Portlaoise for Lynda Dunne", createdate:"2026-10-03T12:52:05Z", stage:"app", amount:440 },
  { id:"524605896896", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for Catherine Lyons", createdate:"2026-10-03T13:53:27Z", stage:"app", amount:440 },
  { id:"524813250780", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Niamh mc donagh", createdate:"2026-10-04T11:22:07Z", stage:"won", amount:309.75 },
  { id:"524829920470", dealname:"Digital Marketing - Online Anytime 1:1 (5N1364 OA DBU) -  for Amy Traynor", createdate:"2026-10-04T15:10:04Z", stage:"app", amount:295 },
  { id:"524841530588", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Lauren Long", createdate:"2026-10-05T07:01:35Z", stage:"app", amount:295 },
  { id:"524881604854", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for ionela simona stroici", createdate:"2026-10-05T10:43:01Z", stage:"app", amount:295 },
  { id:"524872106232", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Alisha O’ Donoghue", createdate:"2026-10-05T10:55:39Z", stage:"won", amount:440 },
  { id:"524861112512", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Tralee for Colleen McMahon", createdate:"2026-10-05T13:12:26Z", stage:"app", amount:440 },
  { id:"524816206018", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Portlaoise for Alyssa Martin", createdate:"2026-10-05T13:33:23Z", stage:"won", amount:440 },
  { id:"524895265003", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for Shaúna O’Halloran", createdate:"2026-10-05T13:42:31Z", stage:"won", amount:440 },
  { id:"524939710708", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Katie Mc daid", createdate:"2026-10-05T15:09:12Z", stage:"app", amount:440 },
  { id:"525133523130", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Shannon Mcglinchey", createdate:"2026-10-05T18:42:27Z", stage:"app", amount:440 },
  { id:"525133556976", dealname:"Human Resources Management - Online Anytime 1:1 (6N3750 OA DBU) -  for Roxanne Donovan", createdate:"2026-10-05T19:16:10Z", stage:"app", amount:380 },
  { id:"525299695825", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Cian Naylor", createdate:"2026-10-05T19:45:29Z", stage:"app", amount:440 },
  { id:"525330286779", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Eimear McHugh", createdate:"2026-10-05T20:52:00Z", stage:"app", amount:440 },
  { id:"525227062496", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dunfanaghy for Patricia Bonner", createdate:"2026-10-05T23:17:13Z", stage:"app", amount:440 },
  { id:"525296255169", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Louise Kennedy", createdate:"2026-10-05T23:36:30Z", stage:"app", amount:440 },
  { id:"525327311073", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Angela Deehan", createdate:"2026-10-06T08:16:07Z", stage:"app", amount:440 },
  { id:"525315151091", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Keelin Doherty", createdate:"2026-10-06T11:07:19Z", stage:"won", amount:295 },
  { id:"525255882974", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Shaúna O'Halloran", createdate:"2026-10-06T12:22:53Z", stage:"app", amount:440 },
  { id:"525186710760", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Jessica Evans", createdate:"2026-10-06T13:58:38Z", stage:"won", amount:309.75 },
  { id:"525331536062", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Niamh Mcbride", createdate:"2026-10-06T14:26:08Z", stage:"won", amount:440 },
  { id:"525231775956", dealname:"Human Resources Management - Online Anytime 1:1 (6N3750 OA DBU) -  for Tugba Cepni", createdate:"2026-10-06T17:32:35Z", stage:"app", amount:380 },
  { id:"525247628480", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Portlaoise for Rachel Kelly", createdate:"2026-10-06T18:30:36Z", stage:"won", amount:440 },
  { id:"525244311744", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Christine SHERIDAN", createdate:"2026-10-06T18:52:05Z", stage:"app", amount:440 },
  { id:"525245970627", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for Linda Murphy", createdate:"2026-10-06T19:13:16Z", stage:"app", amount:440 },
  { id:"525328222407", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Katie O Meara", createdate:"2026-10-06T19:32:03Z", stage:"app", amount:455 },
  { id:"525303201993", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Martina Roarty", createdate:"2026-10-06T21:58:43Z", stage:"app", amount:295 },
  { id:"525303255242", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for wenyi weng", createdate:"2026-10-06T23:20:29Z", stage:"app", amount:440 },
  { id:"525394831594", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Bridget Murphy", createdate:"2026-10-07T09:51:32Z", stage:"app", amount:295 },
  { id:"525257367796", dealname:"Supervisory Management - Online Anytime 1:1 (6N4329 OA DBU) -  for jacques johnson akinyinminu", createdate:"2026-10-07T09:58:26Z", stage:"app", amount:380 },
  { id:"525262081253", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Aimee McNicholas", createdate:"2026-10-07T10:11:59Z", stage:"app", amount:440 },
  { id:"525751241948", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Asta Vilkelyte", createdate:"2026-10-07T10:22:28Z", stage:"won", amount:295 },
  { id:"525756162257", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Eden Maslavi", createdate:"2026-10-07T12:01:55Z", stage:"app", amount:295 },
  { id:"525403008229", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Eden Maslavi", createdate:"2026-10-07T12:04:03Z", stage:"won", amount:295 },
  { id:"525400688853", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Leonie Gibbons", createdate:"2026-10-07T12:26:54Z", stage:"app", amount:440 },
  { id:"525404470499", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Jessica Evans", createdate:"2026-10-07T12:58:57Z", stage:"won", amount:309.75 },
  { id:"525759206636", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Brendan Grennan", createdate:"2026-10-07T15:10:08Z", stage:"app", amount:440 },
  { id:"525753690360", dealname:"Communications (Healthcare) - Online Anytime 1:1 (5N0690 OA DHC) -  for Fanelesibonge Dube", createdate:"2026-10-07T15:26:38Z", stage:"won", amount:309.75 },
  { id:"525757791450", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Pinkie Shabalala", createdate:"2026-10-07T15:30:05Z", stage:"app", amount:295 },
  { id:"525407855853", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Pinkie Shabalala", createdate:"2026-10-07T15:32:26Z", stage:"won", amount:309.75 },
  { id:"525407327446", dealname:"Communications (Healthcare) - Online Anytime 1:1 (5N0690 OA DHC) -  for Pinkie Shabalala", createdate:"2026-10-07T15:42:43Z", stage:"won", amount:309.75 },
  { id:"525765845213", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Ciara Brennan", createdate:"2026-10-07T19:15:09Z", stage:"app", amount:440 },
  { id:"525765253357", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Ciara Brennan", createdate:"2026-10-07T19:18:08Z", stage:"won", amount:440 },
  { id:"525766382806", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Hazel Sheridan", createdate:"2026-10-07T19:23:08Z", stage:"app", amount:440 },
  { id:"525411370191", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Thembi Dlamini", createdate:"2026-10-07T19:54:21Z", stage:"won", amount:299.43 },
  { id:"525412460740", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Miriam O Regan", createdate:"2026-10-07T20:13:20Z", stage:"app", amount:440 },
  { id:"525415007428", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for clara fitzgerald", createdate:"2026-10-07T22:40:57Z", stage:"app", amount:440 },
  { id:"525441454317", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Katie McCarthy", createdate:"2026-10-08T09:44:49Z", stage:"won", amount:440 },
  { id:"525793121519", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for Nuala Cuffe", createdate:"2026-10-08T11:52:14Z", stage:"app", amount:440 },
  { id:"525425380601", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Kayleigh Campbell", createdate:"2026-10-08T12:46:39Z", stage:"won", amount:440 },
  { id:"525795389637", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Eimear McHugh", createdate:"2026-10-08T13:16:33Z", stage:"won", amount:440 },
  { id:"525425480906", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Akhil Chaudhary", createdate:"2026-10-08T14:08:37Z", stage:"won", amount:295 },
  { id:"525798911177", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for jessica evans", createdate:"2026-10-08T14:42:31Z", stage:"won", amount:309.75 },
  { id:"525453259967", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Thurles for Audrey Moroney", createdate:"2026-10-08T15:30:35Z", stage:"app", amount:440 },
  { id:"525456411866", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Jenny Lucas", createdate:"2026-10-08T17:00:27Z", stage:"app", amount:455 },
  { id:"525799814392", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Ralph manda", createdate:"2026-10-08T18:31:10Z", stage:"won", amount:309.75 },
  { id:"525461195965", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anne Gilsenan", createdate:"2026-10-08T19:15:53Z", stage:"app", amount:440 },
  { id:"525808494827", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anne Gilsenan", createdate:"2026-10-08T19:31:19Z", stage:"won", amount:440 },
  { id:"525462337761", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Hannah Dalton", createdate:"2026-10-08T20:49:30Z", stage:"app", amount:440 },
  { id:"525473091791", dealname:"Challenging Behaviour - Online Anytime 1:1 (5N1706 OA DSC) -  for Annette Downey", createdate:"2026-10-08T21:19:53Z", stage:"won", amount:380 },
  { id:"525835807936", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Stephanie Fahey", createdate:"2026-10-09T01:31:08Z", stage:"app", amount:440 },
  { id:"525856370884", dealname:"Supervisory Management - Online Anytime 1:1 (6N4329 OA DBU) -  for Bryan Prendergast", createdate:"2026-10-09T08:13:24Z", stage:"app", amount:380 },
  { id:"525858295023", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Siobhan Monaghan", createdate:"2026-10-09T10:13:34Z", stage:"app", amount:440 },
  { id:"525521630403", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ann Berg", createdate:"2026-10-09T13:28:59Z", stage:"won", amount:440 },
  { id:"525521980608", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Caolan Moore", createdate:"2026-10-09T13:44:35Z", stage:"app", amount:440 },
  { id:"525537165548", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Shannon Smith", createdate:"2026-10-09T16:46:59Z", stage:"won", amount:440 },
  { id:"525884410061", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Anna O'Brien", createdate:"2026-10-09T20:09:37Z", stage:"app", amount:440 },
  { id:"525897894137", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Fiona Griffin", createdate:"2026-10-09T20:52:33Z", stage:"app", amount:440 },
  { id:"525898480840", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Theresa Roche", createdate:"2026-10-09T21:44:08Z", stage:"app", amount:440 },
  { id:"525901181136", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Bray for Roisin Kennedy", createdate:"2026-10-10T10:58:36Z", stage:"app", amount:440 },
  { id:"525932524765", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sumbal Shafqat", createdate:"2026-10-10T13:55:00Z", stage:"app", amount:440 },
  { id:"525965887690", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Pauric Kelly", createdate:"2026-10-10T22:28:55Z", stage:"won", amount:440 },
  { id:"525978535153", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for FIONA BELL", createdate:"2026-10-10T23:19:19Z", stage:"app", amount:295 },
  { id:"525984146622", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Eibhlin Coll", createdate:"2026-10-11T10:08:33Z", stage:"app", amount:440 },
  { id:"526041763040", dealname:"Supervisory Management - Online Anytime 1:1 (6N4329 OA DBU) -  for Milica Vujanic", createdate:"2026-10-11T15:55:20Z", stage:"won", amount:380 },
  { id:"526043773177", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Hashini Rajapaksha", createdate:"2026-10-11T18:37:40Z", stage:"won", amount:440 },
  { id:"526029534420", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rachel Kane", createdate:"2026-10-11T19:37:44Z", stage:"app", amount:440 },
  { id:"526030141652", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Noeleen Langan", createdate:"2026-10-11T20:43:03Z", stage:"app", amount:440 },
  { id:"526019388602", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rachel Maher", createdate:"2026-10-11T21:11:37Z", stage:"app", amount:440 },
  { id:"526058830019", dealname:"Communications (Horticulture) - Online Anytime 1:1 (4N0689 OA DHO) -  for Garvin Fay", createdate:"2026-10-12T09:01:29Z", stage:"app", amount:0 },
  { id:"526073004235", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Boazman Melanie", createdate:"2026-10-12T10:00:32Z", stage:"app", amount:440 },
  { id:"526080615659", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Dympna McCahey", createdate:"2026-10-12T11:18:44Z", stage:"app", amount:440 },
  { id:"526081160397", dealname:"Gerontology - Online Anytime 1:1 (6N3748 OA DHC) -  for Binoy Michael", createdate:"2026-10-12T11:38:59Z", stage:"app", amount:380 },
  { id:"526092864755", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Tamara Guerin", createdate:"2026-10-12T13:31:24Z", stage:"won", amount:295 },
  { id:"525956383944", dealname:"Palliative Care Support - Online Anytime 1:1 (5N3769 OA DHC) -  for Hilary Sheridan", createdate:"2026-10-12T13:44:26Z", stage:"won", amount:309.75 },
  { id:"526105458897", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for  ", createdate:"2026-10-12T15:42:05Z", stage:"app", amount:440 },
  { id:"526106776765", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Jean Enright", createdate:"2026-10-12T16:08:29Z", stage:"won", amount:440 },
  { id:"526112240872", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Colette Mccolgan", createdate:"2026-10-12T17:38:14Z", stage:"app", amount:455 },
  { id:"526112252129", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for FIONA BELL", createdate:"2026-10-12T17:58:40Z", stage:"won", amount:295 },
  { id:"526113564878", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dunfanaghy for Orla alcorn", createdate:"2026-10-12T18:28:30Z", stage:"app", amount:440 },
  { id:"526112733398", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Bray for Eithne Doyle", createdate:"2026-10-12T18:32:42Z", stage:"app", amount:440 },
  { id:"526114586862", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Dunfanaghy for Orla Alcorn", createdate:"2026-10-12T18:53:36Z", stage:"won", amount:440 },
  { id:"526035317993", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Dympna McCahey", createdate:"2026-10-12T19:14:40Z", stage:"won", amount:440 },
  { id:"526123220213", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Miriam O Regan", createdate:"2026-10-12T20:15:49Z", stage:"won", amount:440 },
  { id:"526178653413", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Catherine Mcadam", createdate:"2026-10-13T11:59:39Z", stage:"app", amount:440 },
  { id:"526125792479", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for James Rutledge", createdate:"2026-10-13T12:09:40Z", stage:"won", amount:295 },
  { id:"526184332512", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Madeleine Sénécal", createdate:"2026-10-13T12:52:50Z", stage:"app", amount:440 },
  { id:"526179749096", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Madeleine Sénécal", createdate:"2026-10-13T12:55:03Z", stage:"won", amount:440 },
  { id:"526188364008", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ella O’Neill", createdate:"2026-10-13T14:58:46Z", stage:"won", amount:440 },
  { id:"526188618984", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Margaret Murphy", createdate:"2026-10-13T15:03:09Z", stage:"app", amount:440 },
  { id:"526208444653", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Cellastina Mtofu", createdate:"2026-10-13T16:32:14Z", stage:"app", amount:440 },
  { id:"526255283387", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Lizzy cunningham", createdate:"2026-10-13T19:32:54Z", stage:"app", amount:295 },
  { id:"526498057445", dealname:"Nursing Theory and Practice - Online Anytime 1:1 (5N4325 OA DHC) -  for Malilemo Thakali", createdate:"2026-10-13T20:38:30Z", stage:"won", amount:309.75 },
  { id:"526549466306", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Lara Juhasz", createdate:"2026-10-13T22:31:59Z", stage:"app", amount:295 },
  { id:"526615496895", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sibheal Keyes", createdate:"2026-10-13T23:15:43Z", stage:"app", amount:440 },
  { id:"526624541925", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Aoife O carroll", createdate:"2026-10-14T05:44:12Z", stage:"app", amount:440 },
  { id:"526591014125", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Jenny Byrne", createdate:"2026-10-14T06:05:45Z", stage:"app", amount:440 },
  { id:"526455246039", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Aoife O carroll", createdate:"2026-10-14T06:39:41Z", stage:"won", amount:440 },
  { id:"526635303104", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Leona Buckley", createdate:"2026-10-14T10:15:52Z", stage:"app", amount:295 },
  { id:"526486146290", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Hazel McCormack", createdate:"2026-10-14T10:23:07Z", stage:"won", amount:295 },
  { id:"526444726464", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Melissa Mcdonnell", createdate:"2026-10-14T12:47:35Z", stage:"won", amount:440 },
  { id:"526453905598", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballinasloe for Erica Manning", createdate:"2026-10-14T14:11:42Z", stage:"app", amount:440 },
  { id:"527128307956", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Paul O'keeffe", createdate:"2026-10-14T20:20:48Z", stage:"app", amount:295 },
  { id:"527146323152", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Clonakilty for Megan O Donovan", createdate:"2026-10-14T20:40:11Z", stage:"app", amount:440 },
  { id:"527301745890", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballybofey-Stranorlar for Sabrina Gallagher", createdate:"2026-10-14T20:54:37Z", stage:"app", amount:440 },
  { id:"526995874041", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Lisamarie dunlea", createdate:"2026-10-15T15:53:18Z", stage:"app", amount:295 },
  { id:"527339636924", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Eilis Murphy", createdate:"2026-10-15T21:10:28Z", stage:"app", amount:440 },
  { id:"527739888868", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for Katie Foley", createdate:"2026-10-16T09:51:48Z", stage:"app", amount:440 },
  { id:"528026692810", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Jessica Weafer", createdate:"2026-10-16T14:26:09Z", stage:"app", amount:440 },
  { id:"527927270596", dealname:"Leadership (Healthcare) - Online Anytime 1:1 (6N2191 OA DHC) -  for Sriramya Dhamotharan", createdate:"2026-10-17T10:48:21Z", stage:"app", amount:380 },
  { id:"527956594891", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Margaret o sullivan", createdate:"2026-10-18T10:32:37Z", stage:"app", amount:440 },
  { id:"528419962087", dealname:"Supervisory Management - Online Anytime 1:1 (6N4329 OA DBU) -  for Cassandra Costello", createdate:"2026-10-19T12:04:22Z", stage:"app", amount:380 },
  { id:"528651136221", dealname:"Supervisory Management (Healthcare) - Online Anytime 1:1 (6N4329 OA DHC) -  for Niamh Mac Namara", createdate:"2026-10-19T14:36:01Z", stage:"app", amount:380 },
  { id:"528701554923", dealname:"Supervisory Management (Healthcare) - Online Anytime 1:1 (6N4329 OA DHC) -  for Precious MAdubeko", createdate:"2026-10-19T16:20:46Z", stage:"app", amount:380 },
  { id:"528740262091", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Megan Hanratty", createdate:"2026-10-19T21:55:12Z", stage:"won", amount:440 },
  { id:"528705724665", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Bolanle Moses", createdate:"2026-10-20T08:16:29Z", stage:"app", amount:440 },
  { id:"529025050861", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Nicola Healy", createdate:"2026-10-20T09:08:23Z", stage:"app", amount:295 },
  { id:"528693095654", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Mandy O’Neill", createdate:"2026-10-20T12:10:33Z", stage:"app", amount:440 },
  { id:"528735200460", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Katie Noonan", createdate:"2026-10-20T12:10:57Z", stage:"app", amount:455 },
  { id:"528691432635", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for Lydia Rodgers", createdate:"2026-10-20T12:16:40Z", stage:"won", amount:309.75 },
  { id:"529438061769", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Lisa Breeze", createdate:"2026-10-20T18:01:06Z", stage:"app", amount:295 },
  { id:"529553827051", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Emma McGuire", createdate:"2026-10-20T21:41:04Z", stage:"app", amount:295 },
  { id:"529496472802", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrickmacross for Mandy Fox", createdate:"2026-10-21T06:54:14Z", stage:"app", amount:440 },
  { id:"529751623929", dealname:"Payroll Manual and Computerised - Online Anytime 1:1 (5N1546 OA DBU) -  for Bridget Murphy", createdate:"2026-10-21T06:57:44Z", stage:"app", amount:395 },
  { id:"529543586033", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Jozefina Ivancova", createdate:"2026-10-21T08:30:13Z", stage:"app", amount:0 },
  { id:"529565202657", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Nazia Nargas", createdate:"2026-10-21T09:58:00Z", stage:"app", amount:0 },
  { id:"529445953774", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Louise Carroll", createdate:"2026-10-21T10:07:19Z", stage:"app", amount:0 },
  { id:"529502420163", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anna Tigue", createdate:"2026-10-21T10:14:44Z", stage:"app", amount:440 },
  { id:"529433594104", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Deborah Cull", createdate:"2026-10-21T10:39:47Z", stage:"app", amount:295 },
  { id:"529766301897", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Jade Oladipo", createdate:"2026-10-21T13:22:45Z", stage:"app", amount:295 },
  { id:"529789568240", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Grainne Minogue", createdate:"2026-10-21T13:24:20Z", stage:"app", amount:440 },
  { id:"529541904588", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Grainne Minogue", createdate:"2026-10-21T13:29:57Z", stage:"won", amount:440 },
  { id:"529748489431", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for orla mc glynn", createdate:"2026-10-21T13:30:48Z", stage:"app", amount:0 },
  { id:"529500566755", dealname:"Challenging Behaviour - Online Anytime 1:1 (5N1706 OA DSC) -  for Hannah Griffin", createdate:"2026-10-21T14:02:21Z", stage:"app", amount:380 },
  { id:"529556319473", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ann Cafferty Mulvey", createdate:"2026-10-21T15:45:19Z", stage:"app", amount:440 },
  { id:"529759254735", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Cathal Mulvey", createdate:"2026-10-21T15:52:08Z", stage:"won", amount:440 },
  { id:"529750895822", dealname:"Mental Health Awareness - Online Anytime 1:1 (6N2209 OA DHC) -  for Chenying Zhao", createdate:"2026-10-21T23:09:14Z", stage:"won", amount:360 },
  { id:"529501244634", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Qadar Ahmed Isse", createdate:"2026-10-22T01:07:02Z", stage:"app", amount:0 },
  { id:"529875571904", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Martina Maloney", createdate:"2026-10-22T07:40:55Z", stage:"app", amount:440 },
  { id:"529906470104", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Nicola Walsh", createdate:"2026-10-22T13:50:07Z", stage:"app", amount:440 },
  { id:"530482320599", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Dominic Carr", createdate:"2026-10-22T21:01:04Z", stage:"app", amount:295 },
  { id:"530431730910", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Nicole Cullen", createdate:"2026-10-23T07:08:41Z", stage:"app", amount:295 },
  { id:"530916672743", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Maggie Kennedy", createdate:"2026-10-23T09:40:46Z", stage:"won", amount:295 },
  { id:"530477287625", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Cathal Creevy", createdate:"2026-10-23T09:54:44Z", stage:"app", amount:295 },
  { id:"530542762194", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Cathal Creevy", createdate:"2026-10-23T09:57:51Z", stage:"won", amount:295 },
  { id:"530613600494", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Tara Choules", createdate:"2026-10-23T10:10:08Z", stage:"app", amount:440 },
  { id:"530911679715", dealname:"Supervisory Management (Healthcare) - Online Anytime 1:1 (6N4329 OA DHC) -  for Catherine Glutnic", createdate:"2026-10-23T13:11:42Z", stage:"app", amount:380 },
  { id:"530438118586", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Kate Olabode", createdate:"2026-10-23T17:36:25Z", stage:"app", amount:440 },
  { id:"530478254275", dealname:"Training Delivery and Evaluation - Online Anytime 1:1 (6N3326 OA DBU) -  for Helen Flynn", createdate:"2026-10-23T18:05:15Z", stage:"app", amount:380 },
  { id:"531157876985", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ava Levins", createdate:"2026-10-24T13:25:33Z", stage:"app", amount:440 },
  { id:"531215241430", dealname:"Project Management - Online Anytime 1:1 (6N4090 OA DBU) -  for Jason Finnane", createdate:"2026-10-25T12:56:25Z", stage:"won", amount:380 },
  { id:"531328370897", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for Temidayo Oladehin", createdate:"2026-10-26T08:34:43Z", stage:"app", amount:295 },
  { id:"531660037319", dealname:"Business Administration Skills - Online Anytime 1:1 (5N1610 OA DBU) -  for Lisa Mulcaire", createdate:"2026-10-26T20:38:06Z", stage:"won", amount:295 },
  { id:"531737196730", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Claudia Kelly", createdate:"2026-10-27T08:39:33Z", stage:"app", amount:295 },
  { id:"531713940710", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anne Flavin", createdate:"2026-10-27T08:46:35Z", stage:"won", amount:440 },
  { id:"531653643481", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Lauren Mc Donald", createdate:"2026-10-27T11:19:01Z", stage:"app", amount:455 },
  { id:"531746540750", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Angela O connell", createdate:"2026-10-27T12:30:24Z", stage:"won", amount:295 },
  { id:"532329504984", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Katelyn Gough", createdate:"2026-10-27T15:10:26Z", stage:"won", amount:295 },
  { id:"532842198264", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Donna kelly", createdate:"2026-10-27T19:17:30Z", stage:"won", amount:295 },
  { id:"532678341826", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Bray for Saskia Miller", createdate:"2026-10-27T22:02:16Z", stage:"app", amount:440 },
  { id:"532710860025", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Bray for Татьяна Лукаш", createdate:"2026-10-28T09:26:30Z", stage:"app", amount:440 },
  { id:"532727002326", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Katelyn Gough", createdate:"2026-10-28T09:28:48Z", stage:"app", amount:295 },
  { id:"532929245414", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Princes Mary Jehenna Jekerany", createdate:"2026-10-28T09:52:28Z", stage:"app", amount:295 },
  { id:"532710907074", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Princes Mary Jehenna Jekerany", createdate:"2026-10-28T10:20:42Z", stage:"won", amount:295 },
  { id:"532916746460", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Nora McGowan", createdate:"2026-10-28T12:08:00Z", stage:"app", amount:440 },
  { id:"532741260523", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Nora McGowan", createdate:"2026-10-28T12:16:22Z", stage:"won", amount:440 },
  { id:"532745074875", dealname:"Accounting Manual and Computerised - Online Anytime 1:1 (5N1348 OA DBU) -  for Starr Cerew", createdate:"2026-10-28T16:43:51Z", stage:"app", amount:295 },
  { id:"533287018720", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anna Tigue", createdate:"2026-10-28T23:06:12Z", stage:"won", amount:440 },
  { id:"532829045972", dealname:"Psychology - Online Anytime 1:1 (5N0754 OA DHC) -  for Joanne Duffy", createdate:"2026-10-29T05:39:14Z", stage:"won", amount:295 },
  { id:"532690354387", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Emma Caulfield", createdate:"2026-10-29T11:29:51Z", stage:"app", amount:295 },
  { id:"533349572852", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Margaret Murphy", createdate:"2026-10-29T12:02:26Z", stage:"won", amount:440 },
  { id:"533448770763", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Bray for Emma O'Brien", createdate:"2026-10-29T13:57:33Z", stage:"app", amount:440 },
  { id:"533739735235", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Catherine Duffy", createdate:"2026-10-29T15:46:53Z", stage:"won", amount:440 },
  { id:"533805301994", dealname:"Business Management - Online Anytime 1:1 (6N4310 OA DBU) -  for Ionel-Alexandru Ureche", createdate:"2026-10-29T19:44:11Z", stage:"app", amount:380 },
  { id:"533722448059", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Eve Elizabeth Mackin", createdate:"2026-10-29T23:00:40Z", stage:"app", amount:455 },
  { id:"534578672886", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Eve Elizabeth Mackin", createdate:"2026-10-29T23:32:05Z", stage:"won", amount:455 },
  { id:"534639826127", dealname:"Anatomy and Physiology - Online Anytime 1:1 (5N0749 OA DHC) -  for Clodagh Kenny", createdate:"2026-10-30T21:49:53Z", stage:"app", amount:295 },
  { id:"534645577972", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Molly Allen", createdate:"2026-10-31T11:31:50Z", stage:"app", amount:440 },
  { id:"534733367482", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Eleanor Doherty", createdate:"2026-10-31T14:32:39Z", stage:"app", amount:295 },
  { id:"534866628794", dealname:"Communications (Healthcare) - Online Anytime 1:1 (5N0690 OA DHC) -  for Fatma Cali", createdate:"2026-10-31T16:30:04Z", stage:"won", amount:295 },
  { id:"534827488494", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Sarah Scanlon", createdate:"2026-11-01T10:48:40Z", stage:"app", amount:295 },
  { id:"534646559944", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for Zobia Saqib", createdate:"2026-11-01T22:57:50Z", stage:"app", amount:440 },
  { id:"534856311012", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Michelle Clarke", createdate:"2026-11-02T08:33:25Z", stage:"won", amount:455 },
  { id:"534994107590", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sadie Naidoo", createdate:"2026-11-02T10:29:41Z", stage:"app", amount:440 },
  { id:"534908113085", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Katherine OLeary", createdate:"2026-11-02T19:49:18Z", stage:"app", amount:295 },
  { id:"535013790965", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Riain Hennessy", createdate:"2026-11-02T22:02:49Z", stage:"won", amount:440 },
  { id:"535064363203", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Lauren Burke", createdate:"2026-11-03T03:06:08Z", stage:"won", amount:295 },
  { id:"535070326972", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Mary O Donovan", createdate:"2026-11-03T06:44:30Z", stage:"won", amount:455 },
  { id:"535099749611", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Donal Caffrey", createdate:"2026-11-03T11:25:04Z", stage:"app", amount:295 },
  { id:"535114652921", dealname:"Safety Management (Healthcare) - Online Anytime 1:1 (6N1782 OA DHC) -  for Nomsa Khumalo Ngatsha", createdate:"2026-11-03T12:38:40Z", stage:"app", amount:380 },
  { id:"535116440784", dealname:"Psychology - Online Anytime 1:1 (5N0754 OA DHC) -  for isabelle humphries", createdate:"2026-11-03T13:36:12Z", stage:"app", amount:295 },
  { id:"535151293685", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Bray for isabel Russell", createdate:"2026-11-03T16:39:50Z", stage:"won", amount:440 },
  { id:"535164501208", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Michelle Henry", createdate:"2026-11-03T16:49:33Z", stage:"app", amount:440 },
  { id:"535513332940", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Sharon Cawley", createdate:"2026-11-03T19:42:22Z", stage:"app", amount:440 },
  { id:"535430980844", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Kilkenny for Louise Keating", createdate:"2026-11-03T20:05:54Z", stage:"app", amount:440 },
  { id:"535466989816", dealname:"Mental Health Awareness - Online Anytime 1:1 (6N2209 OA DHC) -  for Kate Houlihan", createdate:"2026-11-03T20:23:12Z", stage:"app", amount:360 },
  { id:"535511688439", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for mya conroy", createdate:"2026-11-04T01:31:34Z", stage:"app", amount:440 },
  { id:"535475908797", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Swinford for Sharon Cawley", createdate:"2026-11-04T09:05:46Z", stage:"won", amount:440 },
  { id:"535427817664", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Alison Keane", createdate:"2026-11-04T10:58:52Z", stage:"won", amount:440 },
  { id:"535765781692", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Tara Sweeney", createdate:"2026-11-04T11:06:20Z", stage:"won", amount:440 },
  { id:"535985992939", dealname:"Person Centred Focus to Disability - Online Anytime 1:1 (5N1728 OA DSC) -  for Peter Larkin", createdate:"2026-11-04T18:55:46Z", stage:"app", amount:295 },
  { id:"535831166181", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Sarah Duignan", createdate:"2026-11-04T21:20:55Z", stage:"won", amount:295 },
  { id:"536478066927", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Susan Armstrong", createdate:"2026-11-04T22:12:03Z", stage:"app", amount:295 },
  { id:"536930729176", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Timna Kangogo", createdate:"2026-11-05T16:29:24Z", stage:"app", amount:295 },
  { id:"536876714179", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Anitta Antony", createdate:"2026-11-05T17:32:58Z", stage:"app", amount:295 },
  { id:"537242820803", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for claire o shea", createdate:"2026-11-05T21:03:37Z", stage:"app", amount:295 },
  { id:"537250018536", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for  ", createdate:"2026-11-05T23:09:56Z", stage:"app", amount:295 },
  { id:"537177047246", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Alicia Curtis", createdate:"2026-11-06T09:57:34Z", stage:"won", amount:440 },
  { id:"537981605110", dealname:"Digital Marketing - Online Anytime 1:1 (5N1364 OA DBU) -  for Caoimhe Mc Donnell", createdate:"2026-11-06T23:46:39Z", stage:"app", amount:295 },
  { id:"537983452408", dealname:"Digital Marketing - Online Anytime 1:1 (5N1364 OA DBU) -  for Caoimhe Mc Donnell", createdate:"2026-11-06T23:48:25Z", stage:"won", amount:295 },
  { id:"538073360591", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lisamarie dunlea", createdate:"2026-11-07T15:48:05Z", stage:"won", amount:440 },
  { id:"538060982478", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Mia Muldarry", createdate:"2026-11-07T19:55:13Z", stage:"won", amount:170 },
  { id:"538119880943", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Anastasia Vasiuta", createdate:"2026-11-07T22:12:31Z", stage:"app", amount:0 },
  { id:"538131274994", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Dikeledi Mushapho", createdate:"2026-11-09T00:39:36Z", stage:"app", amount:0 },
  { id:"538267400417", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Anitta Antony", createdate:"2026-11-09T11:23:49Z", stage:"won", amount:295 },
  { id:"538288929005", dealname:"Plant Identification Care and Maintenance - Online Anytime 1:1 (4N1186 OA DHO) -  for Adeniyi Sanusi", createdate:"2026-11-09T14:53:02Z", stage:"app", amount:0 },
  { id:"538274380024", dealname:"Entrepreneurial Skills - Online Anytime 1:1 (5N1951 OA DBU) -  for  ", createdate:"2026-11-09T17:37:32Z", stage:"app", amount:295 },
  { id:"538535969005", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Killian Walsh", createdate:"2026-11-09T22:44:19Z", stage:"app", amount:295 },
  { id:"538534405336", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for SABRINA TOBIN", createdate:"2026-11-10T08:54:13Z", stage:"app", amount:295 },
  { id:"538469995714", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Kelly Mullaney", createdate:"2026-11-10T09:32:49Z", stage:"won", amount:440 },
  { id:"538911871182", dealname:"Supervisory Management - Online Anytime 1:1 (6N4329 OA DBU) -  for Gloria Isibor Isibor", createdate:"2026-11-10T16:00:10Z", stage:"app", amount:380 },
  { id:"539072130261", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Leanne Devaney", createdate:"2026-11-10T17:46:29Z", stage:"app", amount:440 },
  { id:"539061519574", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Anthony Matheka", createdate:"2026-11-10T21:09:58Z", stage:"app", amount:295 },
  { id:"539544814787", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Keira Leonard", createdate:"2026-11-10T22:35:36Z", stage:"app", amount:455 },
  { id:"539588938947", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Keira Leonard", createdate:"2026-11-10T22:49:28Z", stage:"won", amount:455 },
  { id:"539537685729", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Kristopher Stewart", createdate:"2026-11-11T00:53:46Z", stage:"won", amount:455 },
  { id:"539900912861", dealname:"Payroll Manual and Computerised - Online Anytime 1:1 (5N1546 OA DBU) -  for aisling maguire", createdate:"2026-11-11T17:10:35Z", stage:"app", amount:395 },
  { id:"539826246877", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Cliff Williams", createdate:"2026-11-11T17:52:20Z", stage:"won", amount:440 },
  { id:"539974380792", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Abbi Healy", createdate:"2026-11-11T18:58:04Z", stage:"app", amount:440 },
  { id:"539742617843", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Patrycja Wozniak", createdate:"2026-11-11T20:58:06Z", stage:"app", amount:295 },
  { id:"539724654841", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Karen Mooney", createdate:"2026-11-11T21:05:55Z", stage:"app", amount:295 },
  { id:"539926257853", dealname:"Digital Marketing - Online Anytime 1:1 (5N1364 OA DBU) -  for Alisa Kamara", createdate:"2026-11-11T21:23:27Z", stage:"won", amount:295 },
  { id:"539755505879", dealname:"Barista Training (1169 CNY DBU) - Mullingar for Kayla Comiskey Hogan", createdate:"2026-11-12T09:47:43Z", stage:"app", amount:0 },
];

// ─── PARSING ─────────────────────────────────────────────────────────────────
const DEPT_MAP   = { DSN:"SNA", DHC:"Healthcare", DSC:"Social Care", DBU:"Business", ELC:"ELC", DHP:"Healthcare", DCP:"Other", DHO:"Other" };
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
  const _blocks = [...d.dealname.matchAll(/\(([^()]+)\)/g)];
  const m = _blocks.length ? _blocks[_blocks.length - 1] : null; // last bracket = code block
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
  { wk:"W1", label:"14 Sep–20 Sep", start:new Date("2026-09-13T23:00:00Z"), end:new Date("2026-09-20T22:59:59Z"), full:true  },
  { wk:"W2", label:"21 Sep–27 Sep", start:new Date("2026-09-20T23:00:00Z"), end:new Date("2026-09-27T22:59:59Z"), full:true  },
  { wk:"W3", label:"28 Sep–4 Oct", start:new Date("2026-09-27T23:00:00Z"), end:new Date("2026-10-04T22:59:59Z"), full:true  },
  { wk:"W4", label:"5 Oct–11 Oct", start:new Date("2026-10-04T23:00:00Z"), end:new Date("2026-10-11T22:59:59Z"), full:true  },
  { wk:"W5", label:"12 Oct–18 Oct", start:new Date("2026-10-11T23:00:00Z"), end:new Date("2026-10-18T22:59:59Z"), full:true  },
  { wk:"W6", label:"19 Oct–25 Oct", start:new Date("2026-10-18T23:00:00Z"), end:new Date("2026-10-25T23:59:59Z"), full:true  },
  { wk:"W7", label:"26 Oct–1 Nov", start:new Date("2026-10-26T00:00:00Z"), end:new Date("2026-11-01T23:59:59Z"), full:true  },
  { wk:"W8", label:"2 Nov–8 Nov", start:new Date("2026-11-02T00:00:00Z"), end:new Date("2026-11-08T23:59:59Z"), full:true  },
  { wk:"W9", label:"9 Nov–12 Nov ⚡", start:new Date("2026-11-09T00:00:00Z"), end:new Date("2026-11-12T23:59:59Z"), full:false },
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
          14 Sep – 12 Nov 2026 · W1–W9 · deal create date · ⚡ W9 partial week
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
        Data: HubSpot B2C (Single Modules) pipeline · fetched 12 Nov 2026 · deal create date as week anchor · 65 duplicates + 6 junk records excluded · 9 Closed Lost DND apps excluded · 7 graduated deals (pipeline 110199236) retained, 4 Closed Lost graduates excluded · null Barista won amounts set to €170
      </p>
    </div>
  );
}
