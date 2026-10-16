// Données des cercles de l'Enfer de Dante (Divine Comédie, « Inferno », vers 1304-1321).
// Ce fichier est aussi lu par pdf/generer_pdf.py : il doit rester du JSON valide entre les crochets.
const CERCLES = [
  {
    "id": "vestibule",
    "numero": "Vestibule",
    "nom": "L'Antichambre des Tièdes",
    "peche": "La tiédeur (ignavia) : ceux qui n'ont jamais pris parti, ni pour le bien ni pour le mal, et les anges restés neutres lors de la révolte de Lucifer.",
    "chatiment": "Nus, ils courent sans fin derrière une bannière qui tourne sans jamais s'arrêter, piqués par des guêpes et des frelons. Leur sang mêlé de larmes tombe à leurs pieds, où des vers répugnants le recueillent.",
    "contrapasso": "N'ayant suivi aucune cause de leur vivant, ils poursuivent éternellement un étendard vide de sens. Ils n'ont jamais été piqués par la conscience : ils le sont désormais par les insectes.",
    "gardien": "Charon, le nocher aux yeux de braise, qui fait traverser l'Achéron aux damnés.",
    "personnages": ["Celui qui fit par lâcheté le grand refus (souvent identifié au pape Célestin V)", "Charon"],
    "chants": "Chant III",
    "lieu": "Après la porte portant l'inscription « Vous qui entrez, laissez toute espérance », une plaine obscure s'étend jusqu'au fleuve Achéron.",
    "couleur": "#7d7a6e"
  },
  {
    "id": "limbes",
    "numero": "Cercle I",
    "nom": "Les Limbes",
    "peche": "Aucun péché personnel : les enfants morts sans baptême et les païens vertueux, nés avant le Christ ou ne l'ayant pas connu.",
    "chatiment": "Pas de supplice physique. Ils vivent dans un désir sans espérance de voir Dieu ; l'air ne tremble que de leurs soupirs. Les grands esprits habitent un noble château entouré de sept murailles et d'un ruisseau, dans un pré verdoyant éclairé d'une faible lumière.",
    "contrapasso": "Ils n'ont pas eu la foi : ils sont privés de la vision de Dieu, sans autre souffrance que ce manque éternel.",
    "gardien": "Aucun gardien ; Virgile lui-même habite ce cercle.",
    "personnages": ["Homère", "Horace", "Ovide", "Lucain", "Socrate", "Platon", "Aristote", "Euclide", "Avicenne", "Averroès", "Saladin"],
    "chants": "Chant IV",
    "lieu": "Premier cercle au bord de l'abîme, de l'autre côté de l'Achéron.",
    "couleur": "#6f8f6a"
  },
  {
    "id": "luxure",
    "numero": "Cercle II",
    "nom": "La Luxure",
    "peche": "La luxure : ceux qui ont soumis la raison au désir charnel.",
    "chatiment": "Une tempête infernale qui ne cesse jamais emporte les âmes, les fait tournoyer et les heurte contre les parois rocheuses, comme des étourneaux ou des grues dans le vent.",
    "contrapasso": "Ils se sont laissé emporter par la passion de leur vivant : ils sont emportés pour toujours par l'ouragan.",
    "gardien": "Minos, le juge des Enfers, qui enroule sa queue autour de son corps autant de fois que le damné doit descendre de cercles.",
    "personnages": ["Francesca da Rimini et Paolo Malatesta", "Sémiramis", "Didon", "Cléopâtre", "Hélène", "Achille", "Pâris", "Tristan"],
    "chants": "Chant V",
    "lieu": "Un lieu « muet de toute lumière » qui mugit comme la mer dans la tempête. Ici commence l'Enfer proprement dit, celui des péchés d'incontinence.",
    "couleur": "#8a4f6b"
  },
  {
    "id": "gourmandise",
    "numero": "Cercle III",
    "nom": "La Gourmandise",
    "peche": "La gourmandise : ceux qui ont vécu pour la nourriture et la boisson.",
    "chatiment": "Couchés dans une boue puante, ils subissent une pluie éternelle, froide et lourde, mêlée de grêle, de neige et d'eau noirâtre. Cerbère les griffe, les écorche et les déchire.",
    "contrapasso": "Ils ont joui des plaisirs raffinés de la table : ils gisent dans la fange, sous une pluie immonde, comme des bêtes.",
    "gardien": "Cerbère, chien monstrueux à trois têtes qui aboie sur les âmes.",
    "personnages": ["Ciacco, le Florentin qui prophétise les malheurs de Florence", "Cerbère"],
    "chants": "Chant VI",
    "lieu": "Un marécage boueux battu par la pluie.",
    "couleur": "#5d6b5a"
  },
  {
    "id": "avarice",
    "numero": "Cercle IV",
    "nom": "L'Avarice et la Prodigalité",
    "peche": "L'avarice et son contraire, la prodigalité : le mauvais usage des biens.",
    "chatiment": "Divisés en deux troupes, ils roulent d'énormes poids avec leur poitrine, chacun sur un demi-cercle. Ils se heurtent en se criant « Pourquoi gardes-tu ? » et « Pourquoi jettes-tu ? », puis font demi-tour pour se rencontrer à nouveau à l'autre extrémité.",
    "contrapasso": "Ils ont été obsédés par les biens matériels : ils poussent des fardeaux inutiles. Leur visage est devenu si méconnaissable qu'on ne peut plus distinguer personne.",
    "gardien": "Plutus, dieu de la richesse, qui crie le vers incompréhensible « Pape Satàn, pape Satàn aleppe ! ».",
    "personnages": ["De nombreux clercs, papes et cardinaux", "Plutus"],
    "chants": "Chant VII",
    "lieu": "Une vaste plaine circulaire.",
    "couleur": "#a08a45"
  },
  {
    "id": "colere",
    "numero": "Cercle V",
    "nom": "La Colère et l'Acédie",
    "peche": "La colère (les coléreux) et l'acédie, la paresse morose (les « maussades » qui ont gardé leur rancune en eux).",
    "chatiment": "Dans le marais boueux du Styx, les coléreux se battent nus, se frappent, se mordent et se mettent en pièces. Sous la surface, les maussades étouffés gargouillent : leurs soupirs font des bulles à la surface de l'eau.",
    "contrapasso": "La colère qui les déchirait de leur vivant les fait s'entre-déchirer ; ceux qui ont ruminé leur rage en silence restent noyés dans la vase.",
    "gardien": "Phlégyas, le passeur, qui conduit sa barque à travers le Styx jusqu'aux murailles de la cité de Dité.",
    "personnages": ["Filippo Argenti", "Phlégyas"],
    "chants": "Chants VII et VIII",
    "lieu": "Le Styx, marécage noirâtre, au-delà duquel se dressent les murailles rougeoyantes de la cité de Dité, gardée par des démons et les trois Furies.",
    "couleur": "#3f4a5a"
  },
  {
    "id": "heresie",
    "numero": "Cercle VI",
    "nom": "L'Hérésie",
    "peche": "L'hérésie : ceux qui ont nié la vérité de la foi, notamment les épicuriens, « qui font mourir l'âme avec le corps ».",
    "chatiment": "Enfermés dans des tombeaux ardents, couvercles soulevés jusqu'au Jugement dernier. Les flammes rendent les sépulcres plus brûlants que le fer dans la forge ; les hérétiques de chaque secte sont regroupés.",
    "contrapasso": "Ils ont cru que l'âme mourait avec le corps : ils sont enfermés pour l'éternité dans une tombe.",
    "gardien": "Les Furies (Mégère, Alecto et Tisiphone) et Méduse, sur les murailles de Dité.",
    "personnages": ["Farinata degli Uberti", "Cavalcante dei Cavalcanti", "L'empereur Frédéric II", "Le pape Anastase II"],
    "chants": "Chants IX à XI",
    "lieu": "À l'intérieur des murs de Dité : une vaste campagne parsemée de tombeaux. C'est ici que Virgile explique la structure morale de l'Enfer.",
    "couleur": "#8c3b2a"
  },
  {
    "id": "violence",
    "numero": "Cercle VII",
    "nom": "La Violence",
    "peche": "La violence, répartie en trois girons : contre le prochain, contre soi-même, contre Dieu, la nature et l'art.",
    "chatiment": "Selon le giron : plongés dans un fleuve de sang bouillant, changés en arbres déchirés par les Harpies, ou exposés nus sur un désert de sable brûlant sous une pluie de flammes.",
    "contrapasso": "Ils ont versé le sang : ils y bouillent. Ils ont rejeté leur corps : ils n'en ont plus. Ils ont offensé Dieu et la nature : la nature elle-même devient stérile et le ciel les brûle.",
    "gardien": "Le Minotaure, l'« infamie de Crète », puis les Centaures menés par Chiron et Nessus.",
    "personnages": ["Attila et Alexandre (dans le Phlégéthon)", "Pier della Vigna (changé en arbre)", "Capanée (blasphémateur)", "Brunetto Latini, le maître de Dante"],
    "chants": "Chants XII à XVII",
    "lieu": "Au bas d'un éboulement rocheux, le cercle se divise en trois anneaux concentriques.",
    "couleur": "#9e2b25",
    "subdivisions": [
      {"nom": "1er giron : violents contre le prochain", "peche": "Tyrans, meurtriers et brigands.", "chatiment": "Plongés dans le Phlégéthon, fleuve de sang bouillant, plus ou moins profondément selon la gravité de leurs crimes. Les Centaures tirent des flèches sur ceux qui émergent trop."},
      {"nom": "2e giron : violents contre eux-mêmes", "peche": "Les suicidés et les dissipateurs (ceux qui ont détruit leurs biens).", "chatiment": "Les suicidés sont changés en arbres noueux et épineux dont les Harpies dévorent les feuilles ; chaque branche brisée saigne et parle. Les dissipateurs sont poursuivis et mis en pièces par des chiennes noires."},
      {"nom": "3e giron : violents contre Dieu, la nature et l'art", "peche": "Blasphémateurs, sodomites (selon la morale de l'époque) et usuriers.", "chatiment": "Sur un désert de sable brûlant tombe une lente pluie de flammes : les blasphémateurs sont couchés sur le dos, les sodomites courent sans cesse, les usuriers sont assis, une bourse armoriée pendue au cou."}
    ]
  },
  {
    "id": "fraude",
    "numero": "Cercle VIII",
    "nom": "Malebolge, la Fraude",
    "peche": "La fraude simple, commise envers ceux qui n'avaient pas de raison particulière de faire confiance.",
    "chatiment": "Dix fosses concentriques (les « bolge ») de pierre couleur de fer, reliées par des ponts rocheux. Chaque fosse punit une forme de tromperie.",
    "contrapasso": "Chaque fraude a sa peine en miroir : les devins voient derrière eux, les hypocrites portent des chapes dorées de plomb, les semeurs de discorde sont eux-mêmes fendus.",
    "gardien": "Géryon, monstre au visage d'homme juste, au corps de serpent et à la queue de scorpion, qui transporte Dante et Virgile au fond de l'abîme. Les démons Malebranche gardent la cinquième fosse.",
    "personnages": ["Jason", "Le pape Nicolas III", "Tirésias", "Caïphe", "Vanni Fucci", "Ulysse et Diomède", "Bertran de Born", "Maître Adam le faussaire"],
    "chants": "Chants XVIII à XXX",
    "lieu": "Une immense structure en entonnoir de pierre, en pente vers un puits central gardé par les Géants.",
    "couleur": "#5a5560",
    "subdivisions": [
      {"nom": "1re fosse : ruffians et séducteurs", "peche": "Ceux qui ont trompé des femmes pour leur compte ou celui d'autrui.", "chatiment": "Ils marchent en deux files opposées, fouettés par des démons cornus."},
      {"nom": "2e fosse : flatteurs", "peche": "Ceux qui ont trompé par la flatterie.", "chatiment": "Plongés dans des excréments humains."},
      {"nom": "3e fosse : simoniaques", "peche": "Ceux qui ont vendu les choses saintes et les charges de l'Église.", "chatiment": "Enfoncés la tête en bas dans des trous de la roche, la plante des pieds brûlée par des flammes."},
      {"nom": "4e fosse : devins", "peche": "Devins, astrologues et magiciens.", "chatiment": "La tête tournée à l'envers, ils marchent à reculons en pleurant ; leurs larmes coulent sur leurs reins."},
      {"nom": "5e fosse : prévaricateurs (barattiers)", "peche": "Ceux qui ont trafiqué des charges publiques.", "chatiment": "Plongés dans la poix bouillante ; les démons Malebranche les harponnent avec leurs crocs s'ils remontent."},
      {"nom": "6e fosse : hypocrites", "peche": "Les hypocrites.", "chatiment": "Ils marchent lentement sous de lourdes chapes de plomb dorées à l'extérieur. Caïphe est crucifié au sol et piétiné par tous."},
      {"nom": "7e fosse : voleurs", "peche": "Les voleurs.", "chatiment": "Poursuivis et mordus par des serpents, ils prennent feu, tombent en cendres puis renaissent, ou se transforment en serpents."},
      {"nom": "8e fosse : conseillers perfides", "peche": "Ceux qui ont donné des conseils frauduleux.", "chatiment": "Chacun est enveloppé dans une flamme qui le dérobe à la vue. Ulysse et Diomède partagent une flamme à deux pointes."},
      {"nom": "9e fosse : semeurs de discorde", "peche": "Semeurs de scandale et de schisme.", "chatiment": "Un démon armé d'une épée les fend et les mutile ; leurs blessures se referment pendant qu'ils font le tour de la fosse, puis il les tranche à nouveau. Bertran de Born porte sa tête à la main comme une lanterne."},
      {"nom": "10e fosse : falsificateurs", "peche": "Alchimistes, imposteurs, faux-monnayeurs et menteurs.", "chatiment": "Frappés de maladies : lèpre, gale, hydropisie, fièvre. Ils se grattent, gisent les uns sur les autres dans une puanteur de chair pourrie."}
    ]
  },
  {
    "id": "trahison",
    "numero": "Cercle IX",
    "nom": "Le Cocyte, la Trahison",
    "peche": "La trahison, fraude commise envers ceux qui avaient une raison particulière de faire confiance : le pire des péchés.",
    "chatiment": "Pris dans la glace du lac Cocyte, gelé par le vent des ailes de Lucifer. Plus la trahison est grave, plus le damné est enfoncé dans la glace.",
    "contrapasso": "Ils ont eu le cœur froid et brisé les liens de l'amour : ils sont figés dans la glace, loin de toute chaleur divine.",
    "gardien": "Les Géants enchaînés autour du puits (Nemrod, Éphialte, Antée) ; Lucifer au centre.",
    "personnages": ["Le comte Ugolin et l'archevêque Ruggieri", "Bocca degli Abati", "Frère Albéric", "Judas, Brutus et Cassius, dans les gueules de Lucifer"],
    "chants": "Chants XXXI à XXXIV",
    "lieu": "Le fond de l'Enfer, au centre de la Terre. Lucifer, gigantesque, aux trois visages (rouge, jaunâtre et noir) et aux six ailes de chauve-souris, est pris dans la glace jusqu'à la poitrine.",
    "couleur": "#7fa6c4",
    "subdivisions": [
      {"nom": "Caïne : traîtres à leurs parents", "peche": "Nommée d'après Caïn, meurtrier de son frère.", "chatiment": "Pris jusqu'au cou, le visage baissé : leurs larmes gèlent sur leurs yeux."},
      {"nom": "Anténora : traîtres à leur patrie ou à leur parti", "peche": "Nommée d'après Anténor, le Troyen qui aurait trahi Troie.", "chatiment": "Pris jusqu'au cou, la tête droite. C'est ici qu'Ugolin ronge le crâne de Ruggieri."},
      {"nom": "Ptolomée : traîtres à leurs hôtes", "peche": "Nommée d'après Ptolémée, qui assassina ses invités.", "chatiment": "Couchés sur le dos, les larmes gèlent en visière de cristal dans leurs orbites. Leur âme peut tomber ici avant même la mort de leur corps."},
      {"nom": "Judecca : traîtres à leurs bienfaiteurs", "peche": "Nommée d'après Judas Iscariote.", "chatiment": "Entièrement recouverts par la glace, visibles comme des fétus dans le verre, dans toutes les postures."}
    ]
  }
];
