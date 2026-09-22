/**
 * Comprehensive German Cities & Postal Codes Database
 * Covers major metropolises and regional cities across all 16 German Federal States (Bundesländer).
 */

export interface GermanCity {
  name: string;
  code: string; // 5-digit Postal Code
  state: string; // Bundesland
  lat: number;
  lng: number;
  isMetropolis?: boolean;
}

export const ALL_GERMAN_CITIES: GermanCity[] = [
  // --- Top Metropolen (Bundesweit prominenteste Städte) ---
  { name: 'Berlin', code: '10115', state: 'Berlin', lat: 52.5200, lng: 13.4050, isMetropolis: true },
  { name: 'Hamburg', code: '20095', state: 'Hamburg', lat: 53.5511, lng: 9.9937, isMetropolis: true },
  { name: 'München', code: '80331', state: 'Bayern', lat: 48.1371, lng: 11.5754, isMetropolis: true },
  { name: 'Köln', code: '50667', state: 'Nordrhein-Westfalen', lat: 50.9375, lng: 6.9603, isMetropolis: true },
  { name: 'Frankfurt am Main', code: '60311', state: 'Hessen', lat: 50.1109, lng: 8.6821, isMetropolis: true },
  { name: 'Stuttgart', code: '70173', state: 'Baden-Württemberg', lat: 48.7758, lng: 9.1829, isMetropolis: true },
  { name: 'Düsseldorf', code: '40213', state: 'Nordrhein-Westfalen', lat: 51.2277, lng: 6.7735, isMetropolis: true },
  { name: 'Leipzig', code: '04109', state: 'Sachsen', lat: 51.3397, lng: 12.3731, isMetropolis: true },
  { name: 'Dortmund', code: '44137', state: 'Nordrhein-Westfalen', lat: 51.5136, lng: 7.4653, isMetropolis: true },
  { name: 'Essen', code: '45127', state: 'Nordrhein-Westfalen', lat: 51.4556, lng: 7.0116, isMetropolis: true },
  { name: 'Bremen', code: '28195', state: 'Bremen', lat: 53.0793, lng: 8.8017, isMetropolis: true },
  { name: 'Dresden', code: '01067', state: 'Sachsen', lat: 51.0504, lng: 13.7373, isMetropolis: true },
  { name: 'Hannover', code: '30159', state: 'Niedersachsen', lat: 52.3759, lng: 9.7320, isMetropolis: true },
  { name: 'Nürnberg', code: '90403', state: 'Bayern', lat: 49.4521, lng: 11.0767, isMetropolis: true },
  { name: 'Duisburg', code: '47051', state: 'Nordrhein-Westfalen', lat: 51.4344, lng: 6.7623, isMetropolis: true },
  { name: 'Bochum', code: '44787', state: 'Nordrhein-Westfalen', lat: 51.4818, lng: 7.2162, isMetropolis: true },
  { name: 'Wuppertal', code: '42103', state: 'Nordrhein-Westfalen', lat: 51.2562, lng: 7.1508, isMetropolis: true },
  { name: 'Bielefeld', code: '33602', state: 'Nordrhein-Westfalen', lat: 52.0302, lng: 8.5325, isMetropolis: true },
  { name: 'Bonn', code: '53111', state: 'Nordrhein-Westfalen', lat: 50.7374, lng: 7.0982, isMetropolis: true },
  { name: 'Münster', code: '48143', state: 'Nordrhein-Westfalen', lat: 51.9607, lng: 7.6261, isMetropolis: true },

  // --- Baden-Württemberg ---
  { name: 'Aalen', code: '73430', state: 'Baden-Württemberg', lat: 48.8378, lng: 10.0934 },
  { name: 'Baden-Baden', code: '76530', state: 'Baden-Württemberg', lat: 48.7606, lng: 8.2398 },
  { name: 'Böblingen', code: '71032', state: 'Baden-Württemberg', lat: 48.6853, lng: 9.0142 },
  { name: 'Esslingen am Neckar', code: '73728', state: 'Baden-Württemberg', lat: 48.7428, lng: 9.3073 },
  { name: 'Freiburg im Breisgau', code: '79098', state: 'Baden-Württemberg', lat: 47.9990, lng: 7.8421 },
  { name: 'Friedrichshafen', code: '88045', state: 'Baden-Württemberg', lat: 47.6542, lng: 9.4792 },
  { name: 'Göppingen', code: '73033', state: 'Baden-Württemberg', lat: 48.7058, lng: 9.6586 },
  { name: 'Heidelberg', code: '69115', state: 'Baden-Württemberg', lat: 49.3988, lng: 8.6724 },
  { name: 'Heilbronn', code: '74072', state: 'Baden-Württemberg', lat: 49.1427, lng: 9.2109 },
  { name: 'Karlsruhe', code: '76133', state: 'Baden-Württemberg', lat: 49.0069, lng: 8.4037 },
  { name: 'Konstanz', code: '78462', state: 'Baden-Württemberg', lat: 47.6603, lng: 9.1758 },
  { name: 'Lörrach', code: '79539', state: 'Baden-Württemberg', lat: 47.6156, lng: 7.6631 },
  { name: 'Ludwigsburg', code: '71638', state: 'Baden-Württemberg', lat: 48.8974, lng: 9.1919 },
  { name: 'Mannheim', code: '68159', state: 'Baden-Württemberg', lat: 49.4875, lng: 8.4660 },
  { name: 'Offenburg', code: '77652', state: 'Baden-Württemberg', lat: 48.4738, lng: 7.9449 },
  { name: 'Pforzheim', code: '75172', state: 'Baden-Württemberg', lat: 48.8932, lng: 8.7049 },
  { name: 'Ravensburg', code: '88212', state: 'Baden-Württemberg', lat: 47.7819, lng: 9.6105 },
  { name: 'Reutlingen', code: '72764', state: 'Baden-Württemberg', lat: 48.4833, lng: 9.2167 },
  { name: 'Schwäbisch Gmünd', code: '73525', state: 'Baden-Württemberg', lat: 48.7997, lng: 9.7981 },
  { name: 'Sindelfingen', code: '71063', state: 'Baden-Württemberg', lat: 48.7077, lng: 9.0039 },
  { name: 'Tübingen', code: '72070', state: 'Baden-Württemberg', lat: 48.5216, lng: 9.0576 },
  { name: 'Ulm', code: '89073', state: 'Baden-Württemberg', lat: 48.4011, lng: 9.9876 },
  { name: 'Villingen-Schwenningen', code: '78050', state: 'Baden-Württemberg', lat: 48.0645, lng: 8.4601 },

  // --- Bayern ---
  { name: 'Amberg', code: '92224', state: 'Bayern', lat: 49.4447, lng: 11.8544 },
  { name: 'Ansbach', code: '91522', state: 'Bayern', lat: 49.3009, lng: 10.5719 },
  { name: 'Aschaffenburg', code: '63739', state: 'Bayern', lat: 49.9754, lng: 9.1478 },
  { name: 'Augsburg', code: '86150', state: 'Bayern', lat: 48.3705, lng: 10.8978 },
  { name: 'Bamberg', code: '96047', state: 'Bayern', lat: 49.8988, lng: 10.9028 },
  { name: 'Bayreuth', code: '95444', state: 'Bayern', lat: 49.9482, lng: 11.5783 },
  { name: 'Coburg', code: '96450', state: 'Bayern', lat: 50.2584, lng: 10.9634 },
  { name: 'Erlangen', code: '91052', state: 'Bayern', lat: 49.5978, lng: 11.0037 },
  { name: 'Fürth', code: '90762', state: 'Bayern', lat: 49.4774, lng: 10.9886 },
  { name: 'Hof', code: '95028', state: 'Bayern', lat: 50.3167, lng: 11.9167 },
  { name: 'Ingolstadt', code: '85049', state: 'Bayern', lat: 48.7665, lng: 11.4258 },
  { name: 'Kempten (Allgäu)', code: '87435', state: 'Bayern', lat: 47.7267, lng: 10.3139 },
  { name: 'Landshut', code: '84028', state: 'Bayern', lat: 48.5369, lng: 12.1522 },
  { name: 'Neu-Ulm', code: '89231', state: 'Bayern', lat: 48.3948, lng: 10.0055 },
  { name: 'Passau', code: '94032', state: 'Bayern', lat: 48.5748, lng: 13.4569 },
  { name: 'Regensburg', code: '93047', state: 'Bayern', lat: 49.0134, lng: 12.1016 },
  { name: 'Rosenheim', code: '83022', state: 'Bayern', lat: 47.8564, lng: 12.1289 },
  { name: 'Schweinfurt', code: '97421', state: 'Bayern', lat: 50.0469, lng: 10.2294 },
  { name: 'Straubing', code: '94315', state: 'Bayern', lat: 48.8817, lng: 12.5739 },
  { name: 'Weiden in der Oberpfalz', code: '92637', state: 'Bayern', lat: 49.6766, lng: 12.1642 },
  { name: 'Würzburg', code: '97070', state: 'Bayern', lat: 49.7913, lng: 9.9534 },

  // --- Brandenburg ---
  { name: 'Brandenburg an der Havel', code: '14770', state: 'Brandenburg', lat: 52.4111, lng: 12.5564 },
  { name: 'Cottbus', code: '03046', state: 'Brandenburg', lat: 51.7563, lng: 14.3329 },
  { name: 'Eberswalde', code: '16225', state: 'Brandenburg', lat: 52.8333, lng: 13.8167 },
  { name: 'Frankfurt (Oder)', code: '15230', state: 'Brandenburg', lat: 52.3414, lng: 14.5510 },
  { name: 'Oranienburg', code: '16515', state: 'Brandenburg', lat: 52.7533, lng: 13.2386 },
  { name: 'Potsdam', code: '14467', state: 'Brandenburg', lat: 52.3906, lng: 13.0645 },

  // --- Bremen ---
  { name: 'Bremerhaven', code: '27568', state: 'Bremen', lat: 53.5396, lng: 8.5809 },

  // --- Hessen ---
  { name: 'Bad Homburg vor der Höhe', code: '61348', state: 'Hessen', lat: 50.2274, lng: 8.6148 },
  { name: 'Darmstadt', code: '64283', state: 'Hessen', lat: 49.8728, lng: 8.6512 },
  { name: 'Fulda', code: '36037', state: 'Hessen', lat: 50.5528, lng: 9.6757 },
  { name: 'Gießen', code: '35390', state: 'Hessen', lat: 50.5873, lng: 8.6755 },
  { name: 'Hanau', code: '63450', state: 'Hessen', lat: 50.1332, lng: 8.9288 },
  { name: 'Kassel', code: '34117', state: 'Hessen', lat: 51.3127, lng: 9.4797 },
  { name: 'Marburg', code: '35037', state: 'Hessen', lat: 50.8022, lng: 8.7667 },
  { name: 'Offenbach am Main', code: '63065', state: 'Hessen', lat: 50.1055, lng: 8.7612 },
  { name: 'Rüsselsheim am Main', code: '65428', state: 'Hessen', lat: 49.9950, lng: 8.4119 },
  { name: 'Wetzlar', code: '35578', state: 'Hessen', lat: 50.5578, lng: 8.5022 },
  { name: 'Wiesbaden', code: '65183', state: 'Hessen', lat: 50.0826, lng: 8.2400 },

  // --- Mecklenburg-Vorpommern ---
  { name: 'Greifswald', code: '17489', state: 'Mecklenburg-Vorpommern', lat: 54.0931, lng: 13.3879 },
  { name: 'Neubrandenburg', code: '17033', state: 'Mecklenburg-Vorpommern', lat: 53.5574, lng: 13.2610 },
  { name: 'Rostock', code: '18055', state: 'Mecklenburg-Vorpommern', lat: 54.0924, lng: 12.0991 },
  { name: 'Schwerin', code: '19053', state: 'Mecklenburg-Vorpommern', lat: 53.6355, lng: 11.4012 },
  { name: 'Stralsund', code: '18439', state: 'Mecklenburg-Vorpommern', lat: 54.3153, lng: 13.0903 },
  { name: 'Wismar', code: '23966', state: 'Mecklenburg-Vorpommern', lat: 53.8925, lng: 11.4650 },

  // --- Niedersachsen ---
  { name: 'Braunschweig', code: '38100', state: 'Niedersachsen', lat: 52.2689, lng: 10.5268 },
  { name: 'Celle', code: '29221', state: 'Niedersachsen', lat: 52.6248, lng: 10.0815 },
  { name: 'Cuxhaven', code: '27472', state: 'Niedersachsen', lat: 53.8617, lng: 8.6942 },
  { name: 'Delmenhorst', code: '27749', state: 'Niedersachsen', lat: 53.0506, lng: 8.6314 },
  { name: 'Emden', code: '26721', state: 'Niedersachsen', lat: 53.3672, lng: 7.2064 },
  { name: 'Goslar', code: '38640', state: 'Niedersachsen', lat: 51.9064, lng: 10.4286 },
  { name: 'Göttingen', code: '37073', state: 'Niedersachsen', lat: 51.5413, lng: 9.9158 },
  { name: 'Hameln', code: '31785', state: 'Niedersachsen', lat: 52.1031, lng: 9.3564 },
  { name: 'Hildesheim', code: '31134', state: 'Niedersachsen', lat: 52.1548, lng: 9.9579 },
  { name: 'Lingen (Ems)', code: '49808', state: 'Niedersachsen', lat: 52.5233, lng: 7.3175 },
  { name: 'Lüneburg', code: '21335', state: 'Niedersachsen', lat: 53.2494, lng: 10.4078 },
  { name: 'Oldenburg', code: '26122', state: 'Niedersachsen', lat: 53.1435, lng: 8.2146 },
  { name: 'Osnabrück', code: '49074', state: 'Niedersachsen', lat: 52.2799, lng: 8.0472 },
  { name: 'Salzgitter', code: '38226', state: 'Niedersachsen', lat: 52.1508, lng: 10.3592 },
  { name: 'Wilhelmshaven', code: '26382', state: 'Niedersachsen', lat: 53.5228, lng: 8.1139 },
  { name: 'Wolfsburg', code: '38440', state: 'Niedersachsen', lat: 52.4227, lng: 10.7865 },

  // --- Nordrhein-Westfalen ---
  { name: 'Aachen', code: '52062', state: 'Nordrhein-Westfalen', lat: 50.7753, lng: 6.0839 },
  { name: 'Arnsberg', code: '59755', state: 'Nordrhein-Westfalen', lat: 51.3967, lng: 8.0647 },
  { name: 'Bergisch Gladbach', code: '51465', state: 'Nordrhein-Westfalen', lat: 50.9856, lng: 7.1328 },
  { name: 'Bottrop', code: '46236', state: 'Nordrhein-Westfalen', lat: 51.5247, lng: 6.9228 },
  { name: 'Brilon', code: '59929', state: 'Nordrhein-Westfalen', lat: 51.3957, lng: 8.5746 },
  { name: 'Bünde', code: '32257', state: 'Nordrhein-Westfalen', lat: 52.1975, lng: 8.5833 },
  { name: 'Detmold', code: '32756', state: 'Nordrhein-Westfalen', lat: 51.9367, lng: 8.8783 },
  { name: 'Düren', code: '52349', state: 'Nordrhein-Westfalen', lat: 50.8039, lng: 6.4839 },
  { name: 'Gelsenkirchen', code: '45879', state: 'Nordrhein-Westfalen', lat: 51.5177, lng: 7.0857 },
  { name: 'Gütersloh', code: '33330', state: 'Nordrhein-Westfalen', lat: 51.9064, lng: 8.3789 },
  { name: 'Hagen', code: '58095', state: 'Nordrhein-Westfalen', lat: 51.3671, lng: 7.4633 },
  { name: 'Hamm', code: '59065', state: 'Nordrhein-Westfalen', lat: 51.6811, lng: 7.8184 },
  { name: 'Herford', code: '32052', state: 'Nordrhein-Westfalen', lat: 52.1158, lng: 8.6719 },
  { name: 'Herne', code: '44623', state: 'Nordrhein-Westfalen', lat: 51.5425, lng: 7.2247 },
  { name: 'Iserlohn', code: '58636', state: 'Nordrhein-Westfalen', lat: 51.3769, lng: 7.6953 },
  { name: 'Krefeld', code: '47798', state: 'Nordrhein-Westfalen', lat: 51.3388, lng: 6.5853 },
  { name: 'Leverkusen', code: '51373', state: 'Nordrhein-Westfalen', lat: 51.0458, lng: 6.9856 },
  { name: 'Lippstadt', code: '59555', state: 'Nordrhein-Westfalen', lat: 51.6742, lng: 8.3444 },
  { name: 'Lünen', code: '44532', state: 'Nordrhein-Westfalen', lat: 51.6167, lng: 7.5167 },
  { name: 'Marl', code: '45768', state: 'Nordrhein-Westfalen', lat: 51.6575, lng: 7.0908 },
  { name: 'Minden', code: '32423', state: 'Nordrhein-Westfalen', lat: 52.2889, lng: 8.9197 },
  { name: 'Moers', code: '47441', state: 'Nordrhein-Westfalen', lat: 51.4508, lng: 6.6264 },
  { name: 'Mönchengladbach', code: '41061', state: 'Nordrhein-Westfalen', lat: 51.1805, lng: 6.4428 },
  { name: 'Mülheim an der Ruhr', code: '45468', state: 'Nordrhein-Westfalen', lat: 51.4272, lng: 6.8828 },
  { name: 'Neuss', code: '41460', state: 'Nordrhein-Westfalen', lat: 51.2003, lng: 6.6939 },
  { name: 'Oberhausen', code: '46045', state: 'Nordrhein-Westfalen', lat: 51.4963, lng: 6.8638 },
  { name: 'Paderborn', code: '33098', state: 'Nordrhein-Westfalen', lat: 51.7189, lng: 8.7575 },
  { name: 'Ratingen', code: '40878', state: 'Nordrhein-Westfalen', lat: 51.2964, lng: 6.8486 },
  { name: 'Recklinghausen', code: '45657', state: 'Nordrhein-Westfalen', lat: 51.6161, lng: 7.1983 },
  { name: 'Remscheid', code: '42853', state: 'Nordrhein-Westfalen', lat: 51.1797, lng: 7.1925 },
  { name: 'Siegen', code: '57072', state: 'Nordrhein-Westfalen', lat: 50.8744, lng: 8.0243 },
  { name: 'Soest', code: '59494', state: 'Nordrhein-Westfalen', lat: 51.5714, lng: 8.1067 },
  { name: 'Solingen', code: '42651', state: 'Nordrhein-Westfalen', lat: 51.1714, lng: 7.0847 },
  { name: 'Velbert', code: '42551', state: 'Nordrhein-Westfalen', lat: 51.3400, lng: 7.0425 },
  { name: 'Witten', code: '58452', state: 'Nordrhein-Westfalen', lat: 51.4394, lng: 7.3364 },

  // --- Rheinland-Pfalz ---
  { name: 'Bad Kreuznach', code: '55543', state: 'Rheinland-Pfalz', lat: 49.8456, lng: 7.8672 },
  { name: 'Kaiserslautern', code: '67655', state: 'Rheinland-Pfalz', lat: 49.4447, lng: 7.7690 },
  { name: 'Koblenz', code: '56068', state: 'Rheinland-Pfalz', lat: 50.3569, lng: 7.5890 },
  { name: 'Ludwigshafen am Rhein', code: '67059', state: 'Rheinland-Pfalz', lat: 49.4811, lng: 8.4464 },
  { name: 'Mainz', code: '55116', state: 'Rheinland-Pfalz', lat: 49.9929, lng: 8.2473 },
  { name: 'Neuwied', code: '56564', state: 'Rheinland-Pfalz', lat: 50.4289, lng: 7.4611 },
  { name: 'Speyer', code: '67346', state: 'Rheinland-Pfalz', lat: 49.3175, lng: 8.4319 },
  { name: 'Trier', code: '54290', state: 'Rheinland-Pfalz', lat: 49.7597, lng: 6.6414 },
  { name: 'Worms', code: '67547', state: 'Rheinland-Pfalz', lat: 49.6319, lng: 8.3619 },

  // --- Saarland ---
  { name: 'Homburg (Saar)', code: '66424', state: 'Saarland', lat: 49.3242, lng: 7.3392 },
  { name: 'Neunkirchen', code: '66538', state: 'Saarland', lat: 49.3456, lng: 7.1808 },
  { name: 'Saarbrücken', code: '66111', state: 'Saarland', lat: 49.2402, lng: 6.9969 },

  // --- Sachsen ---
  { name: 'Bautzen', code: '02625', state: 'Sachsen', lat: 51.1815, lng: 14.4244 },
  { name: 'Chemnitz', code: '09111', state: 'Sachsen', lat: 50.8278, lng: 12.9214 },
  { name: 'Freiberg', code: '09599', state: 'Sachsen', lat: 50.9167, lng: 13.3417 },
  { name: 'Görlitz', code: '02826', state: 'Sachsen', lat: 51.1528, lng: 14.9872 },
  { name: 'Plauen', code: '08523', state: 'Sachsen', lat: 50.4950, lng: 12.1383 },
  { name: 'Zwickau', code: '08056', state: 'Sachsen', lat: 50.7189, lng: 12.4922 },

  // --- Sachsen-Anhalt ---
  { name: 'Dessau-Roßlau', code: '06844', state: 'Sachsen-Anhalt', lat: 51.8386, lng: 12.2456 },
  { name: 'Halberstadt', code: '38855', state: 'Sachsen-Anhalt', lat: 51.8953, lng: 11.0531 },
  { name: 'Halle (Saale)', code: '06108', state: 'Sachsen-Anhalt', lat: 51.4828, lng: 11.9697 },
  { name: 'Magdeburg', code: '39104', state: 'Sachsen-Anhalt', lat: 52.1205, lng: 11.6276 },
  { name: 'Stendal', code: '39576', state: 'Sachsen-Anhalt', lat: 52.6053, lng: 11.8597 },
  { name: 'Wittenberg', code: '06886', state: 'Sachsen-Anhalt', lat: 51.8667, lng: 12.6500 },

  // --- Schleswig-Holstein ---
  { name: 'Flensburg', code: '24937', state: 'Schleswig-Holstein', lat: 54.7833, lng: 9.4333 },
  { name: 'Kiel', code: '24103', state: 'Schleswig-Holstein', lat: 54.3233, lng: 10.1228 },
  { name: 'Lübeck', code: '23552', state: 'Schleswig-Holstein', lat: 53.8655, lng: 10.6866 },
  { name: 'Neumünster', code: '24534', state: 'Schleswig-Holstein', lat: 54.0714, lng: 9.9886 },
  { name: 'Norderstedt', code: '22846', state: 'Schleswig-Holstein', lat: 53.7042, lng: 9.9978 },

  // --- Thüringen ---
  { name: 'Eisenach', code: '99817', state: 'Thüringen', lat: 50.9750, lng: 10.3167 },
  { name: 'Erfurt', code: '99084', state: 'Thüringen', lat: 50.9848, lng: 11.0299 },
  { name: 'Gera', code: '07545', state: 'Thüringen', lat: 50.8789, lng: 12.0831 },
  { name: 'Gotha', code: '99867', state: 'Thüringen', lat: 50.9489, lng: 10.7019 },
  { name: 'Jena', code: '07743', state: 'Thüringen', lat: 50.9271, lng: 11.5892 },
  { name: 'Nordhausen', code: '99734', state: 'Thüringen', lat: 51.5033, lng: 10.7933 },
  { name: 'Suhl', code: '98527', state: 'Thüringen', lat: 50.6094, lng: 10.6908 },
  { name: 'Weimar', code: '99423', state: 'Thüringen', lat: 50.9803, lng: 11.3297 }
];

/**
 * Grouped cities by Bundesland for organized optgroup select dropdowns.
 */
export const CITIES_BY_STATE: Record<string, GermanCity[]> = ALL_GERMAN_CITIES.reduce((acc, city) => {
  if (!acc[city.state]) {
    acc[city.state] = [];
  }
  acc[city.state].push(city);
  return acc;
}, {} as Record<string, GermanCity[]>);

// Ensure cities within each state are sorted alphabetically
Object.keys(CITIES_BY_STATE).forEach((state) => {
  CITIES_BY_STATE[state].sort((a, b) => a.name.localeCompare(b.name, 'de'));
});

/**
 * Filtered top metropolitan regions
 */
export const TOP_GERMAN_METROPOLES: GermanCity[] = ALL_GERMAN_CITIES.filter((c) => c.isMetropolis);

/**
 * Find city by exact postal code or partial name
 */
export function findCity(query: string): GermanCity | undefined {
  if (!query) return undefined;
  let clean = query.trim().toLowerCase();
  if (clean === 'bohcum') clean = 'bochum';
  // 1. Match code
  const codeMatch = ALL_GERMAN_CITIES.find((c) => c.code === clean);
  if (codeMatch) return codeMatch;
  if (clean.startsWith('448') || clean.startsWith('447')) {
    const bochum = ALL_GERMAN_CITIES.find((c) => c.name === 'Bochum');
    if (bochum) return bochum;
  }
  // 2. Match name exactly
  const nameMatch = ALL_GERMAN_CITIES.find((c) => c.name.toLowerCase() === clean);
  if (nameMatch) return nameMatch;
  // 3. Match name partial
  return ALL_GERMAN_CITIES.find((c) => c.name.toLowerCase().includes(clean));
}
