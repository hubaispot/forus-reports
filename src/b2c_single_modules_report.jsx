import { useState, useMemo } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from "recharts";

// ─── RAW DEAL DATA (fetched 11 Aug 2026) ─────────────────────────────────────
// Stages: 5381718219 + 5381718220 = Application received | 756357056 = Won
// Exclusions applied: Jean Baeyens test, Kabir Singh Mann tests (×4), TEST TEST (×2),
//   Paul Garry dup app (506633816254), Oran Molloy dup app (506889283801),
//   Kinga/Kania Kania won dups (505699441903, 505708538048),
//   Catherine Nolan dup app (509502104804), Catherine Cunningham dup app (509522338027),
//   Leanne Noonan moved to untracked stage (506203345126),
//   Marie O Sullivan O Shea older app (511245735098),
//   Kathleen Gallagher older app (513368690922 — L6 OA, kept L5 OA 513684338903),
//   Sandra O'Brien oldest+middle apps (510647687417, 511989268723),
//   Serena O'Kane older app (512135469282)
// Graduates from pipeline 110199236 injected as won: Caoimhe Ryan, Ursula Dobson, Nora McCormack
// Katie Smith won override: synthetic ID 507703439553w
// Blueson Biju: dual enrolment — both won deals kept (different courses)
const RAW_DEALS = [
  // ── Self Paid Apps (5381718219) ──────────────────────────────────────────
  { id:"505205340373", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) for Yvonne Nixon",                                                     createdate:"2026-06-02T22:05:18Z", stage:"app", amount:455  },
  { id:"505755864306", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) for Shannon Campbell",                                                 createdate:"2026-06-09T16:09:14Z", stage:"app", amount:295  },
  { id:"505898201284", dealname:"Care Support - Online Anytime 1:1 (Existing Learners) (5N0758 OA EX DHC) -  for Kitumetsi",                                         createdate:"2026-06-12T05:38:15Z", stage:"app", amount:295  },
  { id:"505929233655", dealname:"Safety and Health at Work - Online Anytime 1:1 (5N1794 OA DHC) -  for Amy Broderick",                                               createdate:"2026-06-12T15:47:01Z", stage:"app", amount:295  },
  { id:"505981272309", dealname:"Community Inclusion - Online Anytime 1:1 (5N1740 OA DSC) -  for Richard Walsh",                                                     createdate:"2026-06-13T16:12:03Z", stage:"app", amount:295  },
  { id:"506199597246", dealname:"Applied Behavioural Analysis - Online Anytime 1:1 (5N1729 OA DSC) -  for Samantha Adamson",                                         createdate:"2026-06-16T17:17:27Z", stage:"app", amount:425  },
  { id:"506253296845", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Kate Galvin",                                         createdate:"2026-06-17T10:27:20Z", stage:"app", amount:440  },
  { id:"506517127362", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Laurem Hickey",                                                createdate:"2026-06-17T17:05:16Z", stage:"app", amount:440  },
  { id:"506625732814", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Paul Garry",                                                   createdate:"2026-06-18T10:41:16Z", stage:"app", amount:455  },
  { id:"507511290071", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Irene Geoghegan",                                         createdate:"2026-06-20T11:59:29Z", stage:"app", amount:295  },
  { id:"507502432457", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Jimin George",                                                             createdate:"2026-06-20T21:26:15Z", stage:"app", amount:295  },
  { id:"507703439553", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Katie Smith",                                                  createdate:"2026-06-22T17:57:33Z", stage:"app", amount:295  },
  { id:"507870303434", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Angela Brady",                                                                createdate:"2026-06-24T08:58:21Z", stage:"app", amount:0    },
  { id:"507902588090", dealname:"Customer Service - Online Anytime 1:1 (5N0972 OA DBU) -  for Ina Ciobanu",                                                         createdate:"2026-06-24T11:50:38Z", stage:"app", amount:295  },
  { id:"508227486954", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Fidelma Gillespie",                                                       createdate:"2026-06-25T17:02:55Z", stage:"app", amount:295  },
  { id:"508174669000", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Errika Bates",                                                 createdate:"2026-06-25T20:52:58Z", stage:"app", amount:440  },
  { id:"508196464882", dealname:"Customer Service - Online Anytime 1:1 (5N0972 OA DBU) -  for Kristine Papava",                                                     createdate:"2026-06-26T04:59:13Z", stage:"app", amount:295  },
  { id:"508239231184", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Barnes Barnes",                                    createdate:"2026-06-26T12:03:05Z", stage:"app", amount:295  },
  { id:"508289062075", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aishling Archbold",                                           createdate:"2026-06-28T12:50:37Z", stage:"app", amount:440  },
  { id:"508323620064", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Catherine Cunningham",                                         createdate:"2026-06-28T15:55:36Z", stage:"app", amount:440  },
  { id:"508342737119", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Angela Burns",                                                 createdate:"2026-06-28T19:57:39Z", stage:"app", amount:440  },
  { id:"508503700729", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for sarah oneill",                                                 createdate:"2026-06-29T15:31:53Z", stage:"app", amount:440  },
  { id:"508656610541", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Boyle Boyle",                                                  createdate:"2026-06-29T20:48:22Z", stage:"app", amount:295  },
  { id:"508705209587", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Katie Gleeson",                                                createdate:"2026-06-29T21:58:27Z", stage:"app", amount:440  },
  { id:"508666131691", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for  ",                                                           createdate:"2026-06-30T09:37:30Z", stage:"app", amount:440  },
  { id:"508681581812", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Arklow for Catherine Nolan",                                        createdate:"2026-06-30T10:31:41Z", stage:"app", amount:440  },
  { id:"508976966881", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Annette Murphy",                                               createdate:"2026-06-30T16:13:32Z", stage:"app", amount:440  },
  { id:"508919968971", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Dorotthg Romhanyi",                                                       createdate:"2026-06-30T21:51:12Z", stage:"app", amount:295  },
  { id:"509215858913", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Chloe Murtagh",                                               createdate:"2026-07-01T15:53:17Z", stage:"app", amount:295  },
  { id:"509232141529", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ally Downey",                                                  createdate:"2026-07-01T18:50:58Z", stage:"app", amount:440  },
  { id:"509351507178", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ciara Dooley",                                                 createdate:"2026-07-01T21:22:33Z", stage:"app", amount:440  },
  { id:"509480428767", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for  ",                                                           createdate:"2026-07-02T18:18:48Z", stage:"app", amount:440  },
  { id:"509504175306", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Olivia Reilly",                                               createdate:"2026-07-02T20:38:40Z", stage:"app", amount:440  },
  { id:"509493509345", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for gillian moran",                                          createdate:"2026-07-03T05:36:36Z", stage:"app", amount:440  },
  { id:"509563712757", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Sihle Mnkandla",                                                             createdate:"2026-07-03T19:05:30Z", stage:"app", amount:0    },
  { id:"509638378694", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Molly Maher",                                                 createdate:"2026-07-05T18:31:23Z", stage:"app", amount:440  },
  { id:"509564792030", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Nobuhle Ncube",                                               createdate:"2026-07-05T22:43:31Z", stage:"app", amount:440  },
  { id:"509690450142", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Marie O Shea",                                       createdate:"2026-07-06T18:15:33Z", stage:"app", amount:440  },
  { id:"509690558674", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ritah Nkala",                                                 createdate:"2026-07-06T19:12:46Z", stage:"app", amount:440  },
  { id:"509716877540", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Paddy Murray",                                           createdate:"2026-07-07T13:14:32Z", stage:"app", amount:440  },
  { id:"509824175294", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Brendan Lane",                                                 createdate:"2026-07-08T20:09:59Z", stage:"app", amount:440  },
  { id:"509853437130", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Waterford City for Sarah Freeman",                                 createdate:"2026-07-09T11:05:46Z", stage:"app", amount:440  },
  { id:"509857061059", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Olha Melezhyk",                                               createdate:"2026-07-09T12:00:38Z", stage:"app", amount:440  },
  { id:"509917924553", dealname:"Health Promotion - Online Anytime 1:1 (6N2214 OA DHC) -  for  ",                                                                   createdate:"2026-07-10T15:39:20Z", stage:"app", amount:360  },
  { id:"509954171113", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Chloe Woods",                                                 createdate:"2026-07-10T22:11:48Z", stage:"app", amount:440  },
  { id:"510159136988", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Emma O'Neill",                                                createdate:"2026-07-14T21:20:42Z", stage:"app", amount:440  },
  { id:"510171730136", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Dearbhaile Mayclim",                                          createdate:"2026-07-15T01:46:24Z", stage:"app", amount:440  },
  { id:"510208079093", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sharon Hickey",                                               createdate:"2026-07-15T11:06:29Z", stage:"app", amount:440  },
  { id:"510110693611", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Bolaji Monsurat Adegbayi",                                    createdate:"2026-07-15T11:17:37Z", stage:"app", amount:440  },
  { id:"510230786291", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Lauren Doherty",                                              createdate:"2026-07-15T22:52:39Z", stage:"app", amount:440  },
  { id:"510388675803", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anna Gavigan",                                                 createdate:"2026-07-16T12:57:07Z", stage:"app", amount:440  },
  { id:"510487579893", dealname:"Barista training (1169 CNY DBU) - Mullingar for Christopher Bookless",                                                             createdate:"2026-07-16T15:57:01Z", stage:"app", amount:0    },
  { id:"510472792305", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Geraldine Moran",                                             createdate:"2026-07-16T16:18:14Z", stage:"app", amount:440  },
  { id:"510489483508", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Isabelle Meyler",                                             createdate:"2026-07-16T17:21:55Z", stage:"app", amount:440  },
  { id:"510565759195", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Rachael Kehinde Abraham",                                                    createdate:"2026-07-17T07:30:10Z", stage:"app", amount:0    },
  { id:"510615946436", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for June Kelliher",                                               createdate:"2026-07-17T12:52:06Z", stage:"app", amount:440  },
  { id:"511195293915", dealname:"FAR First Aid Responder (FAR CNY DHP) - Mullingar for Conor McCarthy",                                                             createdate:"2026-07-18T08:43:15Z", stage:"app", amount:0    },
  { id:"511128440014", dealname:"Barista training (1169 CNY DBU) - Mullingar for Oran Sheridan",                                                                    createdate:"2026-07-19T18:01:58Z", stage:"app", amount:0    },
  { id:"511291638979", dealname:"Barista training (1169 CNY DBU) - Mullingar for Olena Ryndia",                                                                     createdate:"2026-07-20T03:46:03Z", stage:"app", amount:0    },
  { id:"511292155073", dealname:"Business Administration Skills - Online Anytime 1:1 (5N1610 OA DBU) -  for Diana Chaikovska",                                      createdate:"2026-07-20T13:42:51Z", stage:"app", amount:295  },
  { id:"511437618424", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Lisa King",                                                   createdate:"2026-07-20T15:49:05Z", stage:"app", amount:295  },
  { id:"511986187459", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Sarah Kelly",                                          createdate:"2026-07-22T13:49:16Z", stage:"app", amount:295  },
  { id:"512132184307", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sandra Loughlin",                                             createdate:"2026-07-23T14:12:40Z", stage:"app", amount:440  },
  { id:"512317967592", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Pauline maguire",                                             createdate:"2026-07-23T19:48:46Z", stage:"app", amount:440  },
  { id:"512961133817", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for niamh kelly",                                                 createdate:"2026-07-25T17:25:00Z", stage:"app", amount:440  },
  { id:"513226249429", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Michelle Healy",                                      createdate:"2026-07-27T09:27:43Z", stage:"app", amount:440  },
  { id:"513446036726", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Thays Dutra",                                                 createdate:"2026-07-27T22:40:51Z", stage:"app", amount:295  },
  { id:"513644798154", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Srebrenka Stojanovic",                                        createdate:"2026-07-28T15:09:15Z", stage:"app", amount:295  },
  { id:"513684338903", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Kathleen Gallagher",                                          createdate:"2026-07-28T17:33:04Z", stage:"app", amount:295  },
  { id:"513618836721", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Marie O Sullivan O Shea",                            createdate:"2026-07-28T22:42:46Z", stage:"app", amount:440  },
  { id:"513800589540", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Anna Doherty",                                         createdate:"2026-07-29T13:04:45Z", stage:"app", amount:295  },
  { id:"513886780657", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rebecca Davis",                                               createdate:"2026-07-30T09:24:06Z", stage:"app", amount:440  },
  { id:"514024872150", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Amy Verling",                                         createdate:"2026-07-30T18:02:46Z", stage:"app", amount:440  },
  { id:"514032645322", dealname:"Challenging Behaviour - Online Anytime 1:1 (5N1706 OA DSC) -  for Alona Trach",                                                    createdate:"2026-07-31T07:24:58Z", stage:"app", amount:380  },
  { id:"514085424335", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Annalee Nallen",                                              createdate:"2026-07-31T11:54:17Z", stage:"app", amount:440  },
  { id:"515024401639", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Newcastle West for Abhiroop Bhattacharya",                         createdate:"2026-08-04T12:05:33Z", stage:"app", amount:440  },
  { id:"515003758786", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Elizabeth Mcmahon",                                           createdate:"2026-08-04T14:04:18Z", stage:"app", amount:455  },
  { id:"515039868096", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Sorcha O Dea",                                         createdate:"2026-08-04T14:43:44Z", stage:"app", amount:295  },
  { id:"515062784216", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Jamie Scanlon",                                               createdate:"2026-08-04T20:55:32Z", stage:"app", amount:440  },
  { id:"515108743382", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Michael Coughlan",                                     createdate:"2026-08-05T10:55:10Z", stage:"app", amount:295  },
  { id:"515052622020", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Blueson Biju",                                                           createdate:"2026-08-05T16:00:40Z", stage:"app", amount:295  },
  { id:"515201299673", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Juan Gabriel Cordoba",                                        createdate:"2026-08-05T17:36:30Z", stage:"app", amount:295  },
  { id:"515261380806", dealname:"Barista training (1169 CNY DBU) - Mullingar for Treasa Shaw",                                                                      createdate:"2026-08-06T21:23:47Z", stage:"app", amount:0    },
  { id:"515350260943", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Siobhan Doherty",                                     createdate:"2026-08-07T09:33:19Z", stage:"app", amount:440  },
  { id:"515350870218", dealname:"Business Administration Skills - Online Anytime 1:1 (5N1610 OA DBU) -  for Millie Earley",                                         createdate:"2026-08-07T11:16:49Z", stage:"app", amount:295  },
  { id:"515286597854", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Katie Tunney",                                           createdate:"2026-08-07T12:59:48Z", stage:"app", amount:440  },
  { id:"515633534172", dealname:"Barista training (1169 CNY DBU) - Mullingar for Helen Nannery",                                                                    createdate:"2026-08-10T19:56:23Z", stage:"app", amount:0    },
  { id:"515745638608", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Camelia Hangan",                                              createdate:"2026-08-10T22:39:31Z", stage:"app", amount:440  },
  { id:"515811014871", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Lucy Cassidy",                                           createdate:"2026-08-10T23:33:34Z", stage:"app", amount:440  },
  // ── Third Party Payer Apps (5381718220) ──────────────────────────────────
  { id:"505797144800", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (Existing Learners) (5N1356 OA EX DHC) -  for Noel Byrne",                      createdate:"2026-06-10T10:33:18Z", stage:"app", amount:295  },
  { id:"506268626117", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Edel Ryan",                                                   createdate:"2026-06-17T06:44:06Z", stage:"app", amount:440  },
  { id:"506565664988", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Rathbone Rathbone",                               createdate:"2026-06-17T19:06:56Z", stage:"app", amount:295  },
  { id:"507064310994", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for lorraine mcdermott",                                                      createdate:"2026-06-19T10:09:13Z", stage:"app", amount:295  },
  { id:"508882640101", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Ballina for Sinead Fox",                                           createdate:"2026-06-30T14:44:09Z", stage:"app", amount:440  },
  { id:"509557342437", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Mullingar for Svitlana Pandei",                                    createdate:"2026-07-03T17:17:44Z", stage:"app", amount:440  },
  { id:"509713138915", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Sean Twomey",                                         createdate:"2026-07-07T10:10:48Z", stage:"app", amount:295  },
  { id:"509816065266", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Marcella Maxwell",                                            createdate:"2026-07-08T14:35:58Z", stage:"app", amount:440  },
  { id:"510139523264", dealname:"Barista training (1169 CNY DBU) - Mullingar for Brendan Tape",                                                                     createdate:"2026-07-14T13:56:52Z", stage:"app", amount:0    },
  { id:"510140278974", dealname:"Barista training (1169 CNY DBU) - Mullingar for Leesha Whyte",                                                                     createdate:"2026-07-14T14:40:21Z", stage:"app", amount:0    },
  { id:"510177593572", dealname:"Barista training (1169 CNY DBU) - Mullingar for Arwa Alkhalifa",                                                                   createdate:"2026-07-15T01:46:06Z", stage:"app", amount:0    },
  { id:"510476278998", dealname:"Barista training (1169 CNY DBU) - Mullingar for Emma Rose Boshuijer",                                                              createdate:"2026-07-16T14:09:38Z", stage:"app", amount:0    },
  { id:"510855113973", dealname:"Barista training (1169 CNY DBU) - Mullingar for Elizabeth Farrell",                                                                createdate:"2026-07-17T13:47:37Z", stage:"app", amount:0    },
  { id:"511141536976", dealname:"Barista training (1169 CNY DBU) - Mullingar for Hannah Fagan",                                                                     createdate:"2026-07-17T21:41:25Z", stage:"app", amount:0    },
  { id:"511543498959", dealname:"Business Administration Skills - Online Anytime 1:1 (5N1610 OA DBU) -  for Estevam Alves de Oliveira",                             createdate:"2026-07-20T22:40:06Z", stage:"app", amount:295  },
  { id:"512340209850", dealname:"Conflict Management - Online Anytime 1:1 (6N2775 OA DHC) -  for Jennifer Whelan",                                                  createdate:"2026-07-23T08:50:08Z", stage:"app", amount:380  },
  { id:"513338051827", dealname:"Text Production - Online Anytime 1:1 (5N1422 OA DBU) -  for Serena O'Kane",                                                       createdate:"2026-07-27T09:21:16Z", stage:"app", amount:295  },
  { id:"513662416114", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Navan for Sandra O'Brien",                                         createdate:"2026-07-28T14:00:34Z", stage:"app", amount:440  },
  { id:"515039198457", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ellie O Sullivan",                                            createdate:"2026-08-04T13:45:10Z", stage:"app", amount:440  },
  { id:"515350230238", dealname:"Barista training (1169 CNY DBU) - Mullingar for Beth Atli",                                                                        createdate:"2026-08-07T09:27:08Z", stage:"app", amount:0    },
  { id:"515350785219", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Khrystyna Zabolotna",                                         createdate:"2026-08-07T12:29:45Z", stage:"app", amount:440  },
  // ── Won (756357056) ───────────────────────────────────────────────────────
  { id:"505719685355", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) for Kania Kania",                                             createdate:"2026-06-09T09:43:02Z", stage:"won", amount:295  },
  { id:"505989396699", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Janine Doherty",                                              createdate:"2026-06-14T07:28:13Z", stage:"won", amount:295  },
  { id:"506186736882", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Nurul Islam",                                                                 createdate:"2026-06-16T11:34:11Z", stage:"won", amount:295  },
  { id:"506231288040", dealname:"Anatomy and Physiology - Online Anytime 1:1 (5N0749 OA DHC) -  for Mc loughlin Mc loughlin",                                      createdate:"2026-06-16T20:36:09Z", stage:"won", amount:295  },
  { id:"506298626274", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Janice Uí Thuama",                                            createdate:"2026-06-17T13:03:27Z", stage:"won", amount:440  },
  { id:"506587284673", dealname:"Psychology - Online Anytime 1:1 (5N0754 OA DHC) -  for Vilija Dockute",                                                           createdate:"2026-06-17T15:37:17Z", stage:"won", amount:295  },
  { id:"506690291950", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Paul Garry",                                                  createdate:"2026-06-18T10:44:57Z", stage:"won", amount:455  },
  { id:"506956136670", dealname:"Accounting Manual and Computerised - Online Anytime 1:1 (5N1348 OA DBU) -  for Oran Molloy",                                       createdate:"2026-06-18T15:39:40Z", stage:"won", amount:295  },
  { id:"507146335419", dealname:"Work Experience (Business Studies) - Online Anytime 1:1 (5N1356 OA DBU) -  for Irene Geoghegan",                                  createdate:"2026-06-19T13:38:43Z", stage:"won", amount:295  },
  { id:"507419788478", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Ethna Killern",                                               createdate:"2026-06-19T14:53:08Z", stage:"won", amount:295  },
  { id:"507703439553w",dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Katie Smith",                                                  createdate:"2026-06-22T17:57:33Z", stage:"won", amount:295  },
  { id:"507886451926", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for  ",                                                           createdate:"2026-06-24T10:08:50Z", stage:"won", amount:295  },
  { id:"507938183361", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Clesham Clesham",                                             createdate:"2026-06-24T19:30:58Z", stage:"won", amount:440  },
  { id:"508132493520", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DSC) -  for Fidelma Gillespie",                                                      createdate:"2026-06-25T17:37:44Z", stage:"won", amount:295  },
  { id:"508134690035", dealname:"Supported Employment - Online Anytime 1:1 (5N1704 OA DSC) -  for Tina Ryan",                                                      createdate:"2026-06-26T05:41:52Z", stage:"won", amount:295  },
  { id:"508163372226", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Pamela Crummy",                                               createdate:"2026-06-26T13:25:43Z", stage:"won", amount:455  },
  { id:"508323271889", dealname:"Communications (Healthcare) - Online Anytime 1:1 (6N1950 OA DHC) -  for Tiia Pelly",                                              createdate:"2026-06-27T21:30:16Z", stage:"won", amount:380  },
  { id:"508295524561", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aishling Archbold",                                           createdate:"2026-06-28T13:05:13Z", stage:"won", amount:440  },
  { id:"508501238006", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Caoimhe Ryan",                                                createdate:"2026-06-29T00:00:00Z", stage:"won", amount:295  },
  { id:"508614021323", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Marie Keane",                                                 createdate:"2026-06-29T18:55:05Z", stage:"won", amount:440  },
  { id:"508786105591", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Ursula Dobson",                                               createdate:"2026-06-30T00:00:00Z", stage:"won", amount:440  },
  { id:"508854659269", dealname:"Text Production - Online Anytime 1:1 (5N1422 OA DBU) -  for Fiona Goodwin",                                                       createdate:"2026-06-30T15:42:17Z", stage:"won", amount:295  },
  { id:"509035003094", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for PEBBIE MAE CONLON",                                           createdate:"2026-06-30T22:19:38Z", stage:"won", amount:440  },
  { id:"508963179726", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Odhran Mc Colgan",                                            createdate:"2026-07-01T09:09:30Z", stage:"won", amount:440  },
  { id:"509254835400", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Hannah Carmody",                                              createdate:"2026-07-01T20:49:55Z", stage:"won", amount:440  },
  { id:"509468536006", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Nora McCormack",                                              createdate:"2026-07-02T00:00:00Z", stage:"won", amount:440  },
  { id:"509632365764", dealname:"Bookkeeping Manual and Computerised - Online Anytime 1:1 (5N1354 OA DBU) -  for Damien Barnes",                                    createdate:"2026-07-05T11:01:44Z", stage:"won", amount:295  },
  { id:"509651830991", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Molly Maher",                                                 createdate:"2026-07-05T20:21:48Z", stage:"won", amount:440  },
  { id:"509639489741", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Rosemarie Lawlor",                                            createdate:"2026-07-05T22:07:45Z", stage:"won", amount:440  },
  { id:"509730565366", dealname:"Nutrition - Online Anytime 1:1 (5N2006 OA DHC) -  for Elaine Murphy",                                                             createdate:"2026-07-08T09:58:27Z", stage:"won", amount:295  },
  { id:"509866016975", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Catriona Mathews",                                     createdate:"2026-07-09T15:31:01Z", stage:"won", amount:295  },
  { id:"509883560184", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Kellyanne delaney",                                           createdate:"2026-07-10T17:52:15Z", stage:"won", amount:440  },
  { id:"509933818053", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Orla Enright",                                               createdate:"2026-07-12T15:12:05Z", stage:"won", amount:440  },
  { id:"510019348695", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Madelyn Walker",                                                          createdate:"2026-07-12T20:04:04Z", stage:"won", amount:295  },
  { id:"510019711177", dealname:"Care Skills - Online Anytime 1:1 (5N2770 OA DHC) -  for Joelma Cristiane Garabine",                                               createdate:"2026-07-12T20:28:40Z", stage:"won", amount:295  },
  { id:"510159345860", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Emma O'Neill",                                                createdate:"2026-07-14T22:21:25Z", stage:"won", amount:440  },
  { id:"510207530216", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Sharon Hickey",                                               createdate:"2026-07-15T11:23:01Z", stage:"won", amount:440  },
  { id:"510461878467", dealname:"Barista training (1169 CNY DBU) - Mullingar for Emma Rose Boshuijer",                                                              createdate:"2026-07-16T14:11:40Z", stage:"won", amount:170  },
  { id:"510454800578", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Geraldine Moran",                                             createdate:"2026-07-16T16:21:17Z", stage:"won", amount:440  },
  { id:"510578336982", dealname:"Barista training (1169 CNY DBU) - Mullingar for Deesathi Vidanage",                                                                createdate:"2026-07-17T09:44:56Z", stage:"won", amount:170  },
  { id:"510871314658", dealname:"Barista training (1169 CNY DBU) - Mullingar for Elizabeth Farrell",                                                                createdate:"2026-07-17T13:52:20Z", stage:"won", amount:170  },
  { id:"510976851172", dealname:"Barista training (1169 CNY DBU) - Mullingar for Sarah Keane",                                                                      createdate:"2026-07-17T16:55:54Z", stage:"won", amount:170  },
  { id:"511235326158", dealname:"Barista training (1169 CNY DBU) - Mullingar for Ciara Finn",                                                                       createdate:"2026-07-18T16:19:24Z", stage:"won", amount:170  },
  { id:"511128761593", dealname:"Special Needs Assisting - Live and Online (5N1786 LO DSN) - Zoom for Donna Power",                                                 createdate:"2026-07-20T04:45:14Z", stage:"won", amount:295  },
  { id:"511298703576", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Anna Gavigan",                                                createdate:"2026-07-20T08:17:26Z", stage:"won", amount:440  },
  { id:"511748434162", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Snezhana Angelova",                                           createdate:"2026-07-21T14:45:17Z", stage:"won", amount:440  },
  { id:"512217608397", dealname:"Anatomy and Physiology - Online Anytime 1:1 (5N0749 OA DHC) -  for Aigbe Sandra Liberty",                                         createdate:"2026-07-22T19:16:42Z", stage:"won", amount:295  },
  { id:"512796773596", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Tanya Flynn",                                                            createdate:"2026-07-24T19:29:32Z", stage:"won", amount:295  },
  { id:"512813004013", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Rebecca Grant",                                               createdate:"2026-07-24T22:11:52Z", stage:"won", amount:295  },
  { id:"512930477247", dealname:"Barista training (1169 CNY DBU) - Mullingar for Patricia Mcintyre",                                                                createdate:"2026-07-25T12:45:55Z", stage:"won", amount:170  },
  { id:"512952131782", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Santiago Mazzei",                                             createdate:"2026-07-25T16:33:19Z", stage:"won", amount:295  },
  { id:"513367669951", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Midleton for Michelle Healy",                                      createdate:"2026-07-27T11:25:29Z", stage:"won", amount:440  },
  { id:"513760180424", dealname:"Communications (Healthcare) - Online Anytime 1:1 (5N0690 OA DHC) -  for Bernadette Bates",                                        createdate:"2026-07-29T09:48:46Z", stage:"won", amount:295  },
  { id:"513809827003", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Carrick on Shannon for Aoife Brady",                               createdate:"2026-07-29T14:41:31Z", stage:"won", amount:440  },
  { id:"513995007213", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Aoife Desmond",                                               createdate:"2026-07-31T11:52:46Z", stage:"won", amount:440  },
  { id:"514315556034", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Chantel Kenny",                                               createdate:"2026-07-31T17:35:07Z", stage:"won", amount:440  },
  { id:"514647626980", dealname:"Challenging Behaviour - Online Anytime 1:1 (5N1706 OA DSC) -  for Alona Trach",                                                    createdate:"2026-08-01T11:55:12Z", stage:"won", amount:380  },
  { id:"514669152498", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Killarney for Marie O Shea",                                       createdate:"2026-08-01T13:09:17Z", stage:"won", amount:440  },
  { id:"514487172322", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Shauna Quinn",                                                createdate:"2026-08-01T14:09:53Z", stage:"won", amount:455  },
  { id:"514915505395", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Tara Lacken",                                                 createdate:"2026-08-03T14:54:11Z", stage:"won", amount:295  },
  { id:"515000555759", dealname:"Special Needs Assisting - Live and Online (6N1957 LO DSN) - Zoom for Melanie Ludlow Roche",                                        createdate:"2026-08-04T12:56:24Z", stage:"won", amount:440  },
  { id:"515032031451", dealname:"Biology - Online Anytime 1:1 (5N2746 OA DHC) -  for Vivien Parker",                                                               createdate:"2026-08-04T14:26:50Z", stage:"won", amount:295  },
  { id:"515101555957", dealname:"Intellectual Disability Studies - Online Anytime 1:1 (5N1652 OA DSC) -  for Michael Coughlan",                                     createdate:"2026-08-05T11:15:18Z", stage:"won", amount:295  },
  { id:"515131712727", dealname:"Care Support - Online Anytime 1:1 (5N0758 OA DHC) -  for Blueson Biju",                                                           createdate:"2026-08-05T16:11:46Z", stage:"won", amount:295  },
  { id:"515213477113", dealname:"Work Experience (Healthcare) - Online Anytime 1:1 (5N1356 OA DHC) -  for Blueson Biju",                                           createdate:"2026-08-05T16:29:49Z", stage:"won", amount:295  },
  { id:"515204935893", dealname:"Infection Prevention and Control - Online Anytime 1:1 (5N3734 OA DHC) -  for Professor Magarai",                                   createdate:"2026-08-05T19:38:18Z", stage:"won", amount:295  },
  { id:"515167935704", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Loughrea for  ",                                                   createdate:"2026-08-06T09:43:33Z", stage:"won", amount:440  },
  { id:"515277684977", dealname:"Special Needs Assisting - Classroom Near You (6N1957 CNY DSN) - Buncrana for Ailish Harkin",                                       createdate:"2026-08-07T10:26:16Z", stage:"won", amount:440  },
  { id:"515607220467", dealname:"Special Needs Assisting - Online Anytime 1:1 (6N1957 OA DSN) -  for Niamh Culleton",                                              createdate:"2026-08-10T13:28:48Z", stage:"won", amount:455  },
  { id:"515738416347", dealname:"Special Needs Assisting - Online Anytime 1:1 (5N1786 OA DSN) -  for Thays Dutra",                                                 createdate:"2026-08-10T21:34:16Z", stage:"won", amount:295  },
];

// ─── PARSING ─────────────────────────────────────────────────────────────────
const DEPT_MAP   = { DSN:"SNA", DHC:"Healthcare", DHP:"Healthcare", DSC:"Social Care", DBU:"Business", ELC:"ELC" };
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
  // Use last parenthetical block for code parsing (handles "(Existing Learners)" prefix)
  const allMatches = [...d.dealname.matchAll(/\(([^)]+)\)/g)];
  const m = allMatches.length > 0 ? allMatches[allMatches.length - 1] : null;
  const codeBlock = m ? m[1] : "";
  const tokens = codeBlock.split(/\s+/);
  const courseCode = tokens[0] || "";

  const levelDigit = courseCode.match(/^(\d)/)?.[1] || "";
  const level = levelDigit ? `L${levelDigit}` : "";

  let delivCode = "", deptCode = "";
  for (const t of tokens.slice(1)) {
    if (t === "EX") continue; // pricing modifier, not dept/delivery
    if (DELIV_MAP[t]) delivCode = t;
    if (DEPT_MAP[t])  deptCode  = t;
  }

  const dept     = DEPT_MAP[deptCode]  || "Other";
  const delivery = DELIV_MAP[delivCode] || "Online Anytime";

  const DELIV_SUFFIXES = [
    " - Online Anytime 1:1", " - Online Anytime",
    " - Live and Online", " - Classroom Near You",
  ];

  // rawName: everything before the first parenthetical block
  const firstParen = d.dealname.indexOf("(");
  let rawName = firstParen > 0
    ? d.dealname.slice(0, firstParen).replace(/\s*[-–]\s*$/, "").trim()
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
  const amount = parseFloat(d.amount) || 0;

  return { ...d, courseName, courseLabel, courseCode, level, delivCode, delivery, dept, deptCode, location, dt, amount };
}

const DEALS = RAW_DEALS.map(parseDeal);

// ─── WEEK BUCKETS (W1 = 15 Jun, last 8 complete weeks + partial W9) ──────────
// All times UTC; Dublin is UTC+1 in summer so Mon 00:00 IST = Sun 23:00 UTC prior day
const WEEKS = [
  { wk:"W1", label:"15 Jun–21 Jun",    start:new Date("2026-06-14T23:00:00Z"), end:new Date("2026-06-21T22:59:59Z"), full:true  },
  { wk:"W2", label:"22 Jun–28 Jun",    start:new Date("2026-06-21T23:00:00Z"), end:new Date("2026-06-28T22:59:59Z"), full:true  },
  { wk:"W3", label:"29 Jun–5 Jul",     start:new Date("2026-06-28T23:00:00Z"), end:new Date("2026-07-05T22:59:59Z"), full:true  },
  { wk:"W4", label:"6 Jul–12 Jul",     start:new Date("2026-07-05T23:00:00Z"), end:new Date("2026-07-12T22:59:59Z"), full:true  },
  { wk:"W5", label:"13 Jul–19 Jul",    start:new Date("2026-07-12T23:00:00Z"), end:new Date("2026-07-19T22:59:59Z"), full:true  },
  { wk:"W6", label:"20 Jul–26 Jul",    start:new Date("2026-07-19T23:00:00Z"), end:new Date("2026-07-26T22:59:59Z"), full:true  },
  { wk:"W7", label:"27 Jul–2 Aug",     start:new Date("2026-07-26T23:00:00Z"), end:new Date("2026-08-02T22:59:59Z"), full:true  },
  { wk:"W8", label:"3 Aug–9 Aug",      start:new Date("2026-08-02T23:00:00Z"), end:new Date("2026-08-09T22:59:59Z"), full:true  },
  { wk:"W9", label:"10 Aug–11 Aug ⚡", start:new Date("2026-08-09T23:00:00Z"), end:new Date("2026-08-11T07:01:32Z"), full:false },
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
          15 Jun – 11 Aug 2026 · deal create date · ⚡ W9 partial week
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
        Data: HubSpot B2C (Single Modules) pipeline · fetched 11 Aug 2026 · deal create date as week anchor
      </p>
    </div>
  );
}
