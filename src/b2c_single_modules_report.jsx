import { useState, useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ─── RAW DEAL DATA (fetched 20 Jul 2026) ─────────────────────────────────────
// Stages: 5381718219 + 5381718220 = Application received | 756357056 = Won
// amount = deal amount from HubSpot (null / "" if not set; stored as number or 0)
// Dedup applied: Paul Garry app (kept 506625732814), Oran Molloy app (kept 506956136670),
//   Kinga/Kania Kania won (kept 505719685355, removed 505699441903 + 505708538048),
//   Catherine Nolan dup app (kept 508681581812, removed 509502104804),
//   Catherine Cunningham dup app (kept 508323620064, removed 509522338027)
// Excluded: Jean Baeyens test (506376313071), Kabir Singh Mann test x4
//   (508233096441, 508679958747, 508647996609, 510574814456), TEST TEST deals (508233396464, 510076083390)
// Excluded: Leanne Noonan (506203345126) — stage 5381718218 (untracked), NOT graduated
// Graduated to pipeline 110199236 but KEPT by request: 508501238006 Caoimhe Ryan (won),
//   508786105591 Ursula Dobson (won), 509468536006 Nora McCormack (won)
// Katie Smith dual-entry: 507703439553 = app, 507703439553w = won override
// Aishling Archbold dual-entry: 508289062075 = app, 508295524561 = won (normal pipeline)
// Jamie O'Leary dual-entry: 508899538121 = app, 509329082570 = won (normal pipeline)
// Molly Maher dual-entry: 509638378694 = app, 509651830991 = won (normal pipeline)
// Barnes: 508239231184 "Barnes Barnes" app + 509632365764 "Damien Barnes" won = same person (both kept)
// Stage changes applied: 506956136670 Oran Molloy app→won, 508854659269 Fiona Goodwin app→won
const RAW_DEALS = [
  { id:"505205340373",  dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) for Yvonne Nixon",  createdate:"2026-06-02T22:05:18.651Z", stage:"app", amount:455  },
  { id:"505719685355",  dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) for Kania Kania",  createdate:"2026-06-09T09:43:02.446Z", stage:"won", amount:295  },
  { id:"505755864306",  dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) for Shannon Campbell",  createdate:"2026-06-09T16:09:14.751Z", stage:"app", amount:295  },
  { id:"505797144800",  dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (Existing Learners) (5N1356 OA EX DHC) -  for Noel Byrne",  createdate:"2026-06-10T10:33:18.548Z", stage:"app", amount:295  },
  { id:"505898201284",  dealname:"Care Support - Online Anytime 1:1 (Existing Learners) (5N0758 OA EX DHC) -  for Kitumetsi ",  createdate:"2026-06-12T05:38:15.990Z", stage:"app", amount:295  },
  { id:"505929233655",  dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for Amy Broderick",  createdate:"2026-06-12T15:47:01.229Z", stage:"app", amount:295  },
  { id:"505981272309",  dealname:"Community Inclusion - Online Anytime 1:1 (5N1740 OA DSC) -  for Richard Walsh",  createdate:"2026-06-13T16:12:03.430Z", stage:"app", amount:295  },
  { id:"505989396699",  dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Janine Doherty",  createdate:"2026-06-14T07:28:13.054Z", stage:"won", amount:295  },
  { id:"506186736882",  dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Nurul Islam",  createdate:"2026-06-16T11:34:11.786Z", stage:"won", amount:295  },
  { id:"506199597246",  dealname:"Applied Behavioural Analysis - Online Anytime 1:1 (5N1729 OA DSC) -  for Samantha Adamson",  createdate:"2026-06-16T17:17:27.154Z", stage:"app", amount:425  },
  { id:"506231288040",  dealname:"Anatomy and Physiology - Online Anytime 1:1 (5N0749 OA DHC) -  for Mc loughlin Mc loughlin",  createdate:"2026-06-16T20:36:09.747Z", stage:"app", amount:295  },
  { id:"506268626117",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Edel Ryan",  createdate:"2026-06-17T06:44:06.341Z", stage:"app", amount:440  },
  { id:"506253296845",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Kate Galvin",  createdate:"2026-06-17T10:27:20.225Z", stage:"app", amount:440  },
  { id:"506298626274",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Janice Uí Thuama",  createdate:"2026-06-17T13:03:27.801Z", stage:"won", amount:440  },
  { id:"506587284673",  dealname:"Psychology - Online Anytime 1:1 (5N0754 OA DHC) -  for Vilija Dockute",  createdate:"2026-06-17T15:37:17.865Z", stage:"won", amount:295  },
  { id:"506517127362",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Laurem Hickey",  createdate:"2026-06-17T17:05:16.908Z", stage:"app", amount:440  },
  { id:"506565664988",  dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Rathbone Rathbone",  createdate:"2026-06-17T19:06:56.119Z", stage:"app", amount:295  },
  { id:"506625732814",  dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Paul Garry",  createdate:"2026-06-18T10:41:16.662Z", stage:"app", amount:455  },
  { id:"506690291950",  dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Paul Garry",  createdate:"2026-06-18T10:44:57.760Z", stage:"won", amount:455  },
  { id:"506956136670",  dealname:"Accounting Manual and Computerised - Online Anytime 1:1 (5N1348 OA DBU) -  for Oran Molloy",  createdate:"2026-06-18T15:39:40.947Z", stage:"won", amount:295  },
  { id:"507064310994",  dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for lorraine mcdermott",  createdate:"2026-06-19T10:09:13.828Z", stage:"app", amount:295  },
  { id:"507146335419",  dealname:"Work Experience (Business Studies) - Online Anytime 1:1 (5N1356 OA DBU) -  for Irene Geoghegan",  createdate:"2026-06-19T13:38:43.927Z", stage:"won", amount:295  },
  { id:"507419788478",  dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Ethna Killern",  createdate:"2026-06-19T14:53:08.248Z", stage:"won", amount:295  },
  { id:"507511290071",  dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Irene Geoghegan",  createdate:"2026-06-20T11:59:29.794Z", stage:"app", amount:295  },
  { id:"507502432457",  dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Jimin George",  createdate:"2026-06-20T21:26:15.876Z", stage:"app", amount:295  },
  { id:"507703439553",  dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Katie Smith",  createdate:"2026-06-22T17:57:33.639Z", stage:"app", amount:295  },
  { id:"507703439553w",  dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Katie Smith",  createdate:"2026-06-22T17:57:33.639Z", stage:"won", amount:295  },
  { id:"507715458261",  dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Aoife Doran",  createdate:"2026-06-22T23:18:01.722Z", stage:"app", amount:295  },
  { id:"507870303434",  dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Angela Brady",  createdate:"2026-06-24T08:58:21.825Z", stage:"app", amount:0  },
  { id:"507886451926",  dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for  ",  createdate:"2026-06-24T10:08:50.584Z", stage:"won", amount:295  },
  { id:"507902588090",  dealname:"Customer Service - Online Anytime 1:1 (5N0972 OA DBU) -  for Ina Ciobanu",  createdate:"2026-06-24T11:50:38.221Z", stage:"app", amount:295  },
  { id:"507938183361",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Clesham Clesham",  createdate:"2026-06-24T19:30:58.768Z", stage:"won", amount:440  },
  { id:"508227486954",  dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Fidelma Gillespie",  createdate:"2026-06-25T17:02:55.856Z", stage:"app", amount:295  },
  { id:"508132493520",  dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Fidelma Gillespie",  createdate:"2026-06-25T17:37:44.278Z", stage:"won", amount:295  },
  { id:"508174669000",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Errika Bates",  createdate:"2026-06-25T20:52:58.497Z", stage:"app", amount:440  },
  { id:"508196464882",  dealname:"Customer Service - Online Anytime 1:1 (5N0972 OA DBU) -  for Kristine Papava",  createdate:"2026-06-26T04:59:13.742Z", stage:"app", amount:295  },
  { id:"508134690035",  dealname:"Supported Employment - Online Anytime 1:1 (5N1704 OA DSC) -  for Tina Ryan",  createdate:"2026-06-26T05:41:52.562Z", stage:"won", amount:295  },
  { id:"508239231184",  dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Barnes Barnes",  createdate:"2026-06-26T12:03:05.361Z", stage:"app", amount:295  },
  { id:"508163372226",  dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Pamela Crummy",  createdate:"2026-06-26T13:25:43.808Z", stage:"won", amount:455  },
  { id:"508323271889",  dealname:"Communications (Healthcare) - Online Anytime 1:1 (6N1950 OA DHC) -  for Tiia Pelly",  createdate:"2026-06-27T21:30:16.419Z", stage:"won", amount:380  },
  { id:"508289062075",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aishling Archbold",  createdate:"2026-06-28T12:50:37.205Z", stage:"app", amount:440  },
  { id:"508295524561",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aishling Archbold",  createdate:"2026-06-28T13:05:13.289Z", stage:"won", amount:440  },
  { id:"508323620064",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Catherine Cunningham",  createdate:"2026-06-28T15:55:36.886Z", stage:"app", amount:440  },
  { id:"508342737119",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Angela Burns",  createdate:"2026-06-28T19:57:39.802Z", stage:"app", amount:440  },
  { id:"508501238006",  dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Caoimhe Ryan",  createdate:"2026-06-29T13:07:52.155Z", stage:"won", amount:295  },
  { id:"508503700729",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for sarah oneill",  createdate:"2026-06-29T15:31:53.169Z", stage:"app", amount:440  },
  { id:"508614021323",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Marie Keane",  createdate:"2026-06-29T18:55:05.741Z", stage:"won", amount:440  },
  { id:"508656610541",  dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Boyle Boyle",  createdate:"2026-06-29T20:48:22.271Z", stage:"app", amount:295  },
  { id:"508705209587",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Katie Gleeson",  createdate:"2026-06-29T21:58:27.765Z", stage:"app", amount:440  },
  { id:"508666131691",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for  ",  createdate:"2026-06-30T09:37:30.129Z", stage:"app", amount:440  },
  { id:"508786105591",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Ursula Dobson",  createdate:"2026-06-30T09:46:57.175Z", stage:"won", amount:440  },
  { id:"508681581812",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Catherine Nolan",  createdate:"2026-06-30T10:31:41.964Z", stage:"app", amount:440  },
  { id:"508882640101",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Sinead Fox",  createdate:"2026-06-30T14:44:09.834Z", stage:"app", amount:440  },
  { id:"508854659269",  dealname:"Text Production - Online Anytime 1:1 (5N1422 OA DBU) -  for Fiona Goodwin",  createdate:"2026-06-30T15:42:17.575Z", stage:"won", amount:295  },
  { id:"508976966881",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Annette Murphy",  createdate:"2026-06-30T16:13:32.240Z", stage:"app", amount:440  },
  { id:"508919968971",  dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Dorotthg Romhanyi",  createdate:"2026-06-30T21:51:12.387Z", stage:"app", amount:295  },
  { id:"509035003094",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for PEBBIE MAE CONLON",  createdate:"2026-06-30T22:19:38.152Z", stage:"won", amount:440  },
  { id:"508963179726",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Odhran Mc Colgan",  createdate:"2026-07-01T09:09:30.441Z", stage:"won", amount:440  },
  { id:"508899538121",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Jamie O'Leary",  createdate:"2026-07-01T13:17:56.320Z", stage:"app", amount:440  },
  { id:"509215858913",  dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Chloe Murtagh",  createdate:"2026-07-01T15:53:17.736Z", stage:"app", amount:295  },
  { id:"509232141529",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ally Downey",  createdate:"2026-07-01T18:50:58.714Z", stage:"app", amount:440  },
  { id:"509254835400",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Hannah Carmody",  createdate:"2026-07-01T20:49:55.196Z", stage:"won", amount:440  },
  { id:"509351507178",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ciara Dooley",  createdate:"2026-07-01T21:22:33.637Z", stage:"app", amount:440  },
  { id:"509329082570",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Letterkenny for Jamie OLeary",  createdate:"2026-07-02T14:39:17.174Z", stage:"won", amount:440  },
  { id:"509480428767",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for  ",  createdate:"2026-07-02T18:18:48.990Z", stage:"app", amount:440  },
  { id:"509504175306",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Olivia Reilly",  createdate:"2026-07-02T20:38:40.696Z", stage:"app", amount:440  },
  { id:"509493509345",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for gillian moran",  createdate:"2026-07-03T05:36:36.653Z", stage:"app", amount:440  },
  { id:"509468536006",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Nora McCormack",  createdate:"2026-07-03T11:39:14.168Z", stage:"won", amount:440  },
  { id:"509557342437",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Svitlana Pandei",  createdate:"2026-07-03T17:17:44.741Z", stage:"app", amount:440  },
  { id:"509563712757",  dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Sihle Mnkandla",  createdate:"2026-07-03T19:05:30.038Z", stage:"app", amount:0  },
  { id:"509632365764",  dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Damien Barnes",  createdate:"2026-07-05T11:01:44.087Z", stage:"won", amount:295  },
  { id:"509638378694",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Molly Maher",  createdate:"2026-07-05T18:31:23.449Z", stage:"app", amount:440  },
  { id:"509651830991",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Molly Maher",  createdate:"2026-07-05T20:21:48.695Z", stage:"won", amount:440  },
  { id:"509639489741",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rosemarie Lawlor",  createdate:"2026-07-05T22:07:45.923Z", stage:"won", amount:440  },
  { id:"509564792030",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Nobuhle Ncube",  createdate:"2026-07-05T22:43:31.064Z", stage:"app", amount:440  },
  { id:"509690450142",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Marie O Shea",  createdate:"2026-07-06T18:15:33.415Z", stage:"app", amount:440  },
  { id:"509690558674",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ritah Nkala",  createdate:"2026-07-06T19:12:46.565Z", stage:"app", amount:440  },
  { id:"509713138915",  dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Sean Twomey",  createdate:"2026-07-07T10:10:48.102Z", stage:"app", amount:295  },
  { id:"509716877540",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Paddy Murray",  createdate:"2026-07-07T13:14:32.474Z", stage:"app", amount:440  },
  { id:"509730565366",  dealname:"Nutrition - Online Anytime 1:1 (5N2006 OA DHC) -  for Elaine Murphy",  createdate:"2026-07-08T09:58:27.361Z", stage:"won", amount:295  },
  { id:"509804833007",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Amie O'Shea",  createdate:"2026-07-08T10:41:44.464Z", stage:"app", amount:440  },
  { id:"509816065266",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Marcella Maxwell",  createdate:"2026-07-08T14:35:58.572Z", stage:"app", amount:440  },
  { id:"509824175294",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Brendan Lane",  createdate:"2026-07-08T20:09:59.991Z", stage:"app", amount:440  },
  { id:"509853437130",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for Sarah Freeman",  createdate:"2026-07-09T11:05:46.756Z", stage:"app", amount:440  },
  { id:"509857061059",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Olha Melezhyk",  createdate:"2026-07-09T12:00:38.416Z", stage:"app", amount:440  },
  { id:"509866016975",  dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Catriona Mathews",  createdate:"2026-07-09T15:31:01.181Z", stage:"won", amount:295  },
  { id:"509917924553",  dealname:"Health Promotion - Online Anytime 1:1 (6N2214 OA DHC) -  for  ",  createdate:"2026-07-10T15:39:20.817Z", stage:"app", amount:360  },
  { id:"509883560184",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Kellyanne delaney",  createdate:"2026-07-10T17:52:15.701Z", stage:"won", amount:440  },
  { id:"509954171113",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Chloe Woods",  createdate:"2026-07-10T22:11:48.882Z", stage:"app", amount:440  },
  { id:"509933818053",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Orla Enright",  createdate:"2026-07-12T15:12:05.055Z", stage:"won", amount:440  },
  { id:"510019348695",  dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Madelyn Walker",  createdate:"2026-07-12T20:04:04.969Z", stage:"won", amount:295  },
  { id:"510019711177",  dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Joelma Cristiane Garabine",  createdate:"2026-07-12T20:28:40.274Z", stage:"won", amount:295  },
  { id:"510139523264",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Brendan Tape",  createdate:"2026-07-14T13:56:52.128Z", stage:"app", amount:0  },
  { id:"510140278974",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Leesha Whyte",  createdate:"2026-07-14T14:40:21.795Z", stage:"app", amount:0  },
  { id:"510159136988",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Emma O'Neill",  createdate:"2026-07-14T21:20:42.015Z", stage:"app", amount:440  },
  { id:"510159345860",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Emma O'Neill",  createdate:"2026-07-14T22:21:25.012Z", stage:"won", amount:440  },
  { id:"510177593572",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Arwa Alkhalifa",  createdate:"2026-07-15T01:46:06.929Z", stage:"app", amount:0  },
  { id:"510171730136",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Dearbhaile Mayclim",  createdate:"2026-07-15T01:46:24.385Z", stage:"app", amount:440  },
  { id:"510208079093",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sharon Hickey",  createdate:"2026-07-15T11:06:29.829Z", stage:"app", amount:440  },
  { id:"510110693611",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Bolaji Monsurat Adegbayi",  createdate:"2026-07-15T11:17:37.248Z", stage:"app", amount:440  },
  { id:"510207530216",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sharon Hickey",  createdate:"2026-07-15T11:23:01.113Z", stage:"won", amount:440  },
  { id:"510230786291",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lauren Doherty",  createdate:"2026-07-15T22:52:39.465Z", stage:"app", amount:440  },
  { id:"510388675803",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anna Gavigan",  createdate:"2026-07-16T12:57:07.833Z", stage:"app", amount:440  },
  { id:"510476278998",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Emma Rose Boshuijer",  createdate:"2026-07-16T14:09:38.710Z", stage:"app", amount:0  },
  { id:"510461878467",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Emma Rose Boshuijer",  createdate:"2026-07-16T14:11:40.682Z", stage:"won", amount:0  },
  { id:"510487579893",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Christopher Bookless",  createdate:"2026-07-16T15:57:01.752Z", stage:"app", amount:0  },
  { id:"510472792305",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Geraldine Moran",  createdate:"2026-07-16T16:18:14.834Z", stage:"app", amount:440  },
  { id:"510454800578",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Geraldine Moran",  createdate:"2026-07-16T16:21:17.458Z", stage:"won", amount:440  },
  { id:"510489483508",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Isabelle Meyler",  createdate:"2026-07-16T17:21:55.746Z", stage:"app", amount:440  },
  { id:"510565759195",  dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Rachael Kehinde Abraham",  createdate:"2026-07-17T07:30:10.957Z", stage:"app", amount:0  },
  { id:"510578336982",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Deesathi Vidanage",  createdate:"2026-07-17T09:44:56.324Z", stage:"won", amount:0  },
  { id:"510647687417",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for SANDRA O'BRIEN",  createdate:"2026-07-17T09:48:02.665Z", stage:"app", amount:440  },
  { id:"510615946436",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for June Kelliher",  createdate:"2026-07-17T12:52:06.039Z", stage:"app", amount:440  },
  { id:"510855113973",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Elizabeth Farrell",  createdate:"2026-07-17T13:47:37.929Z", stage:"app", amount:0  },
  { id:"510871314658",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Elizabeth Farrell",  createdate:"2026-07-17T13:52:20.370Z", stage:"won", amount:0  },
  { id:"510976851172",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Sarah Keane",  createdate:"2026-07-17T16:55:54.373Z", stage:"won", amount:0  },
  { id:"511141536976",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Hannah Fagan",  createdate:"2026-07-17T21:41:25.731Z", stage:"app", amount:0  },
  { id:"511195293915",  dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Conor McCarthy",  createdate:"2026-07-18T08:43:15.604Z", stage:"app", amount:0  },
  { id:"511245735098",  dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Marie O Sullivan o shea",  createdate:"2026-07-18T13:06:40.127Z", stage:"app", amount:440  },
  { id:"511235326158",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Ciara Finn",  createdate:"2026-07-18T16:19:24.765Z", stage:"won", amount:0  },
  { id:"511128440014",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Oran Sheridan",  createdate:"2026-07-19T18:01:58.563Z", stage:"app", amount:0  },
  { id:"511291638979",  dealname:"Barista training (1169 CNY DBU) - Mullingar for Olena Ryndia",  createdate:"2026-07-20T03:46:03.661Z", stage:"app", amount:0  },
  { id:"511128761593",  dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Donna Power",  createdate:"2026-07-20T04:45:14.107Z", stage:"won", amount:295  },
  { id:"511298703576",  dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anna Gavigan",  createdate:"2026-07-20T08:17:26.821Z", stage:"won", amount:440  },
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
  const allParens = [...d.dealname.matchAll(/\(([^)]+)\)/g)];
  const m = allParens.length ? allParens[allParens.length - 1] : null;
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
  rawName = rawName.replace(/\s*\([^)]*\)\s*/g, "").trim();
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
  { wk:"W1", label:"1 Jun–7 Jun",       start:new Date("2026-05-31T23:00:00Z"), end:new Date("2026-06-07T22:59:59Z"), full:true  },
  { wk:"W2", label:"8 Jun–14 Jun",      start:new Date("2026-06-07T23:00:00Z"), end:new Date("2026-06-14T22:59:59Z"), full:true  },
  { wk:"W3", label:"15 Jun–21 Jun",     start:new Date("2026-06-14T23:00:00Z"), end:new Date("2026-06-21T22:59:59Z"), full:true  },
  { wk:"W4", label:"22 Jun–28 Jun",     start:new Date("2026-06-21T23:00:00Z"), end:new Date("2026-06-28T22:59:59Z"), full:true  },
  { wk:"W5", label:"29 Jun–5 Jul",      start:new Date("2026-06-28T23:00:00Z"), end:new Date("2026-07-05T22:59:59Z"), full:true  },
  { wk:"W6", label:"6 Jul–12 Jul",      start:new Date("2026-07-05T23:00:00Z"), end:new Date("2026-07-12T22:59:59Z"), full:true  },
  { wk:"W7", label:"13 Jul–19 Jul",     start:new Date("2026-07-12T23:00:00Z"), end:new Date("2026-07-19T22:59:59Z"), full:true  },
  { wk:"W8", label:"20 Jul–20 Jul ⚡", start:new Date("2026-07-19T23:00:00Z"), end:new Date("2026-07-20T09:21:46Z"), full:false },
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
          1 Jun – 20 Jul 2026 · deal create date · ⚡ W8 partial week
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
        Data: HubSpot B2C (Single Modules) pipeline · fetched 20 Jul 2026 · deal create date as week anchor
      </p>
    </div>
  );
}
