export interface Station {
  id: number | string;
  n: string;
  a: string;
  p: string;
  h: string;
  lat: number;
  lon: number;
  wc: boolean;
  dog: boolean;
  late: boolean;
  community?: boolean;
  desc?: string;
  photoUrl?: string;
  submittedAt?: string;
  verified?: boolean;
  reportCount?: number;
}

export const stations: Station[] = [
  {id:0, n:"Gesundheitsamt Münster", a:"Stühmerweg 8", p:"48147", h:"Mo–Do 8–16, Fr 8–13", lat:51.96970, lon:7.63550, wc:false, dog:false, late:false},
  {id:1, n:"gruene wiese", a:"Spiekerhof 29", p:"48143", h:"Mo–Fr 11–19, Sa 10:30–18", lat:51.96433, lon:7.62418, wc:false, dog:false, late:true},
  {id:2, n:"fairTEILBAR Münster", a:"Hammer Straße 60", p:"48153", h:"Di–Do 10–18, Fr 14–18, Sa 10–14", lat:51.95031, lon:7.62456, wc:false, dog:false, late:false},
  {id:3, n:"forum natura", a:"Friedrich-Ebert-Str. 114", p:"48153", h:"Di–Fr 9–18", lat:51.94631, lon:7.63031, wc:false, dog:false, late:false},
  {id:4, n:"Frau Többen Fashion", a:"Hammer Straße 25", p:"48153", h:"Mo–Fr 10–18:30, Sa 10–17", lat:51.95340, lon:7.62610, wc:false, dog:false, late:false},
  {id:5, n:"Löwen Tankstelle", a:"Dülmener Straße 16", p:"48163", h:"9–20", lat:51.92540, lon:7.52560, wc:false, dog:true, late:false},
  {id:6, n:"The Body Shop", a:"Aegidiistr. 3", p:"48143", h:"Mo–Fr 9:30–19, Sa 9:30–18", lat:51.96032, lon:7.62409, wc:false, dog:false, late:true},
  {id:7, n:"Unterwegs Outdoor", a:"Rosenstraße 5–6", p:"48143", h:"Mo–Fr 10–18:30, Sa 10–18", lat:51.96520, lon:7.62260, wc:false, dog:false, late:false},
  {id:8, n:"Franz Hitze Haus", a:"Kardinal-von-Galen-Ring 50", p:"48149", h:"Mo–Sa 8–18, So 8–13", lat:51.95600, lon:7.60230, wc:true, dog:false, late:false},
  {id:9, n:"KSHG Münster", a:"Frauenstraße 3–6", p:"48143", h:"9–22", lat:51.96380, lon:7.62150, wc:false, dog:false, late:true},
  {id:10, n:"Stadtwerke Münster", a:"Hafenplatz 1", p:"48155", h:"Mo–Fr 9–16", lat:51.95041, lon:7.63862, wc:false, dog:false, late:false},
  {id:11, n:"Bahnhofsmission (Gleis 12)", a:"Berliner Platz 8–10", p:"48143", h:"Mo–Fr 8–20, Sa–So 13–17", lat:51.95578, lon:7.63563, wc:true, dog:false, late:true},
  {id:12, n:"Draußen e.V.", a:"Von-Kluck-Straße 15", p:"48143", h:"10–15", lat:51.95520, lon:7.62490, wc:false, dog:false, late:false},
  {id:13, n:"Medizin-Bibliothek Uni", a:"Albert-Schweitzer-Campus 1", p:"48149", h:"Mo–Fr 8–24, Sa–So 10–24", lat:51.96090, lon:7.59920, wc:true, dog:false, late:true},
  {id:14, n:"Trekking König", a:"Windthorststraße 35", p:"48143", h:"Mo–Fr 10–19, Sa 9:30–18", lat:51.95828, lon:7.62962, wc:false, dog:false, late:true},
  {id:15, n:"AOK NordWest", a:"Königstraße 18/20", p:"48143", h:"Mo+Do 8:30–18, Di 8:30–17", lat:51.95720, lon:7.62670, wc:true, dog:false, late:false},
  {id:16, n:"Bahnhofsmission Hbf", a:"Hauptbahnhof Gleis 9/12", p:"48143", h:"Mo–Fr 8–20", lat:51.95013, lon:7.61330, wc:true, dog:false, late:true},
  {id:17, n:"Servicezentrum Münster", a:"Heinrich-Brüning-Str. 7", p:"48143", h:"Mo–Fr 8–18, Sa 8–16", lat:51.96140, lon:7.62961, wc:true, dog:false, late:false},
  {id:18, n:"Adler Apotheke", a:"Salzstraße 58", p:"48143", h:"Mo–Fr 8:15–19, Sa 9–18", lat:51.96235, lon:7.62918, wc:false, dog:false, late:true},
  {id:19, n:"Gudrun Sjödén", a:"Prinzipalmarkt 48", p:"48143", h:"Mo–Fr 10–19, Sa 10–18", lat:51.96303, lon:7.62811, wc:false, dog:false, late:true},
  {id:20, n:"Starbucks Hauptbahnhof", a:"Berliner Platz 8–10", p:"48143", h:"Mo–Sa 6–22, So 6:30–21", lat:51.95671, lon:7.63405, wc:true, dog:false, late:true},
  {id:21, n:"Starbucks Hanse Carree", a:"Hanse Carree", p:"48143", h:"Mo–Fr 7:30–20:30", lat:51.95943, lon:7.62883, wc:true, dog:false, late:true},
  {id:22, n:"Haus der Nachhaltigkeit", a:"Hammer Str. 1", p:"48153", h:"Di+Do 10–16, Mi 10–18", lat:51.95490, lon:7.62650, wc:true, dog:false, late:false},
  {id:23, n:"a.cat kollektiv", a:"Herwarthstraße 7", p:"48143", h:"Mi–Fr 19–00, Sa 14–00", lat:51.95600, lon:7.63250, wc:false, dog:false, late:true},
  {id:24, n:"la tienda e.V.", a:"Frauenstraße 7", p:"48143", h:"Mo–Fr 10–18, Sa 11–14:30", lat:51.96363, lon:7.62108, wc:false, dog:false, late:false},
  {id:25, n:"Heinrich Petzhold GmbH", a:"Prinzipalmarkt 5", p:"48143", h:"Mo–Sa 9:30–19", lat:51.96206, lon:7.62829, wc:false, dog:false, late:true},
  {id:26, n:"Lückertz Reisebüro", a:"Salzstraße 36", p:"48143", h:"Mo–Fr 9:30–19, Sa 10–18", lat:51.96068, lon:7.63274, wc:false, dog:false, late:true},
  {id:27, n:"Adler Vital Reformhaus", a:"Salzstraße 58", p:"48143", h:"Mo–Fr 8:30–18:30, Sa 9–18", lat:51.96227, lon:7.62915, wc:false, dog:false, late:false},
  {id:28, n:"Cibaria Bio Bäckerei", a:"Bremer Straße 56", p:"48155", h:"Mo–Fr 7:30–17:30, Sa 7:30–12", lat:51.95343, lon:7.63640, wc:false, dog:false, late:false},
  {id:29, n:"Onkel Alex", a:"Marktallee 41", p:"48165", h:"Mo–Fr 10–18", lat:51.90435, lon:7.64492, wc:true, dog:true, late:false},
  {id:30, n:"Cibaria Bio Hafen", a:"Am Mittelhafen 46", p:"48155", h:"Mo–Fr 10–16", lat:51.95070, lon:7.64500, wc:false, dog:false, late:false},
  {id:31, n:"Marmeladenmanufaktur", a:"Blücherstraße 16", p:"48153", h:"Di–Fr 10–18, Sa 10–13", lat:51.94991, lon:7.63165, wc:false, dog:false, late:false},
  {id:32, n:"ZUM WOHLFÜLLEN", a:"Langemarckstraße 10", p:"48147", h:"Mo–Fr 9:30–19, Sa 10–17", lat:51.97293, lon:7.62940, wc:false, dog:false, late:true},
  {id:33, n:"RUMS Münster", a:"Neubrückenstraße 8–11", p:"48155", h:"10–16:30", lat:51.94970, lon:7.65420, wc:false, dog:false, late:false},
  {id:34, n:"Andreas Döpker Friseure", a:"Ludgeriplatz 11–13", p:"48151", h:"Di–Fr 10–19, Do 10–20", lat:51.95584, lon:7.62534, wc:false, dog:false, late:true},
  {id:35, n:"Ska Treff", a:"Skagerrakstrasse 2", p:"48145", h:"Mo–Do 9–18, Fr 9–17", lat:51.96690, lon:7.65883, wc:false, dog:false, late:false},
  {id:36, n:"handwerkstatt münster", a:"Zumsandestr. 32", p:"48145", h:"Mo–Fr 10–12:30", lat:51.95948, lon:7.64103, wc:false, dog:false, late:false},
  {id:37, n:"Johanniter Regionalstelle", a:"Geringhoffstraße 45/47", p:"48163", h:"Mo–Fr 7–19", lat:51.93101, lon:7.60163, wc:true, dog:false, late:false},
  {id:38, n:"KüchenTreff Münster", a:"Haus Uhlenkoten 6", p:"48159", h:"10–18", lat:51.99323, lon:7.57006, wc:false, dog:false, late:false},
  {id:39, n:"Pfarrzentrum St. Clemens", a:"Patronatsstraße 2", p:"48165", h:"Mo–Fr 8–12:30", lat:51.90440, lon:7.64050, wc:false, dog:false, late:false},
  {id:40, n:"Pfarrheim St. Marien", a:"Loddenweg 8a", p:"48165", h:"Mo 9–12, Di 9–11", lat:51.90690, lon:7.66760, wc:false, dog:false, late:false},
  {id:41, n:"STA Travel Münster", a:"Frauenstr. 25", p:"48143", h:"Mo–Fr 10–19, Sa 10–14", lat:51.96334, lon:7.61840, wc:false, dog:false, late:true},
  {id:42, n:"Auszeit – Mein Tag", a:"Beelertstiege 5–6", p:"48143", h:"Mo–Fr 10:30–19, Sa 10–16", lat:51.95803, lon:7.62801, wc:false, dog:false, late:true},
  {id:43, n:"Adenauer & Co", a:"Rothenburg 14–16", p:"48143", h:"Mo–Sa 10–19", lat:51.96044, lon:7.62515, wc:false, dog:false, late:true},
  {id:44, n:"New Optics Newels", a:"Bült 7", p:"48134", h:"Mo–Fr 9:30–18:30, Sa 10–16", lat:51.96417, lon:7.63087, wc:false, dog:false, late:false},
  {id:45, n:"Das Schönwerk", a:"Warendorfer Straße 71", p:"48145", h:"Mo–Fr 10–18:30, Sa 10–14", lat:51.96302, lon:7.64503, wc:false, dog:false, late:false},
  {id:46, n:"Overschmidt Yachtschule", a:"Annette-Allee 1", p:"48149", h:"Mo–Do 9–16, Fr 9–14", lat:51.95764, lon:7.61471, wc:false, dog:false, late:false},
  {id:47, n:"Blumenhaus Harbaum", a:"Himmelreichallee 45", p:"48149", h:"Mo–Fr 8–17, Sa 8–13", lat:51.95960, lon:7.61190, wc:false, dog:false, late:false},
  {id:48, n:"Umwelthaus Münster", a:"Zumsandestraße 15", p:"48145", h:"Mo–Do 9–12", lat:51.96044, lon:7.64145, wc:false, dog:false, late:false},
  {id:49, n:"Infopunkt Hiltrup", a:"Marktallee 38", p:"48165", h:"Mo–Fr 10–12, 16–18", lat:51.90390, lon:7.64330, wc:false, dog:false, late:false},
  {id:50, n:"AOK NordWest (2)", a:"Königstraße 18/20", p:"48143", h:"On request", lat:51.96250, lon:7.62520, wc:false, dog:false, late:false},
  {id:51, n:"Stromspar-Check Caritas", a:"Kinderhauser Str. 102", p:"48147", h:"On request", lat:51.98085, lon:7.61406, wc:false, dog:false, late:false},
  {id:52, n:"Johanniter Pflege", a:"An der alten Ziegelei 20", p:"48157", h:"Mo–Fr 8–16", lat:51.99628, lon:7.66562, wc:false, dog:false, late:false},
  {id:53, n:"interface medien", a:"Scheibenstraße 119", p:"48153", h:"Mo–Fr 9–16", lat:51.93838, lon:7.62841, wc:false, dog:false, late:false},
  {id:54, n:"Schründer Schlafräume", a:"Weselerstraße 77", p:"48151", h:"On request", lat:51.95121, lon:7.61846, wc:false, dog:false, late:false},
  {id:55, n:"Südviertelbüro", a:"Hammer Straße 69", p:"48153", h:"Mo–Fr 10–12", lat:51.94922, lon:7.62469, wc:false, dog:false, late:false},
  {id:56, n:"Doro Dot Design", a:"Marktallee 18", p:"48165", h:"Fr 10–17", lat:51.90306, lon:7.64019, wc:false, dog:false, late:false},
  {id:57, n:"Autohaus Fischer", a:"Dahlweg 121", p:"48153", h:"Mo–Fr 7–18", lat:51.93969, lon:7.62995, wc:false, dog:false, late:false},
  {id:58, n:"ZAQUENSIS Service", a:"Eisenbahnstraße 11", p:"48143", h:"Mo–Fr 8–17", lat:51.96089, lon:7.63495, wc:false, dog:false, late:false},
  {id:59, n:"Auszeit (2)", a:"Rothenburg 20", p:"48143", h:"Mo–Sa 10–19", lat:51.96100, lon:7.62600, wc:false, dog:false, late:true},
  {id:60, n:"Draußen e.V. (2)", a:"Von-Kluck-Straße 17", p:"48143", h:"10–15", lat:51.95560, lon:7.62510, wc:false, dog:false, late:false},
  {id:61, n:"Cibaria Bio (3)", a:"Bremer Str. 60", p:"48155", h:"Mo–Fr 7:30–17:30", lat:51.95380, lon:7.63700, wc:false, dog:false, late:false},
];
