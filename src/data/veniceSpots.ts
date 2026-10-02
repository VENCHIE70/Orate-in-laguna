import { VeniceSpot } from '../types';

export const VENICE_SPOTS: VeniceSpot[] = [
  {
    id: 'malamocco',
    name: 'Bocca di Porto di Malamocco (Alberoni / Dighe)',
    zone: 'Bocche di Porto',
    depthRange: '8 - 16 metri',
    bestTidePhase: 'Cambio marea & Montante iniziale (corrente sostenuta)',
    description: 'La bocca più profonda e strategica della laguna. Punto di passaggio obbligato per le orate giganti (1.5 - 4 kg) sia in entrata (maggio-giugno) sia in uscita autunnale (settembre-novembre).',
    targetOrataSize: 'Orate da trofeo (1.5 - 4+ kg)',
    coordinates: { lat: 45.332, lng: 12.315 },
    recommendedBaits: ['Granchio verde vivo (moeca o ripario)', 'Bibi di Chioggia', 'Cozza legata su 2 ami'],
    tacticalTip: 'Usa piombi pesanti (90-130g) durante il culmine della corrente e scendi a 50-70g nella stanca. Terminale lungo in fluorocarbon (150-180cm, 0.24-0.28mm).'
  },
  {
    id: 'lido_sannicolo',
    name: 'Bocca di Porto di Lido (San Nicolò / Cavallino)',
    zone: 'Bocche di Porto',
    depthRange: '6 - 12 metri',
    bestTidePhase: 'Ultime 2 ore di marea montante fino al colmo',
    description: 'Fondale misto sabbia e ciottoli con scogliere artificiali. Acqua limpidissima che attrae banchi di orate a caccia di granchi, cannolicchi e telline.',
    targetOrataSize: 'Pezzature medie e grandi (800g - 2.5 kg)',
    coordinates: { lat: 45.426, lng: 12.433 },
    recommendedBaits: ['Cannolicchio fresco intero', 'Bibi', 'Arenicola per pesci diffidenti'],
    tacticalTip: 'Pesca a fondo a ridosso dei massi della scogliera interna o sul ciglio del canale di transito dei traghetti. Alba e tramonto regalano partenze fulminee.'
  },
  {
    id: 'chioggia_caroman',
    name: 'Bocca di Chioggia (Diga di Sottomarina e Oasi Caroman)',
    zone: 'Bocche di Porto',
    depthRange: '7 - 14 metri',
    bestTidePhase: 'Marea montante e primo calante',
    description: 'Accesso sud alla laguna veneziana con banchi di mitili storici. Frequentata costantemente da branchi di orate a caccia lungo la gettata dei massi frangiflutti.',
    targetOrataSize: 'Orate di tutte le taglie (500g - 3 kg)',
    coordinates: { lat: 45.234, lng: 12.298 },
    recommendedBaits: ['Granchietto col guscio inciso', 'Cozza fresca con valve socchiuse', 'Bibi'],
    tacticalTip: 'Innesca il granchio privandolo delle zampe posteriori o con doppio amo. Occhio agli incagli sui massi di fondo: ferrata pronta e canna alta.'
  },
  {
    id: 'canale_petroli',
    name: 'Canale dei Petroli (San Leonardo & Curva Alberoni)',
    zone: 'Canali Navigabili',
    depthRange: '10 - 15 metri (sul fondo), 1.5 - 3m (scalino/barene)',
    bestTidePhase: 'Marea montante (quando l\'acqua risale sulle cigline)',
    description: 'Il canale navigabile più profondo che attraversa la laguna centrale. Le orate stazionano nel canale durante la secca e risalgono lo scalino fangoso appena la marea cresce.',
    targetOrataSize: 'Orate medie e grandi (1 - 3 kg)',
    coordinates: { lat: 45.365, lng: 12.268 },
    recommendedBaits: ['Granchio ripario vivo', 'Murice (bovoletto rotto)', 'Cozza con guscio'],
    tacticalTip: 'Il segreto è lanciare esattamente sul gradino (tra i 3 e i 6 metri di profondità) e non al centro del canale dove la corrente trascina il filo.'
  },
  {
    id: 'pellestrina_barene',
    name: 'Scalini e Velme di Pellestrina / Portosecco',
    zone: 'Barene e Bassifondi',
    depthRange: '1 - 4 metri',
    bestTidePhase: 'Pieno colmo di marea (quando le barene sono allagate)',
    description: 'Ambiente tipico lagunare veneziano. Con l\'alta marea (da +60cm in su), le orate pascolano letteralmente a 1 metro d\'acqua tra fango e zolle di barena cercando vermi e granchietti.',
    targetOrataSize: 'Orate e spigole (600g - 2 kg)',
    coordinates: { lat: 45.289, lng: 12.302 },
    recommendedBaits: ['Arenicola', 'Bibi piccolo', 'Granchio di fango molle (moeca)'],
    tacticalTip: 'Massima discrezione a bordo barca: l\'acqua bassa rende le orate estremamente diffidenti. Piombatura leggerissima (20-40g scorrevole) e lenze sottili.'
  },
  {
    id: 'laguna_nord_treporti',
    name: 'Laguna Nord (Canale Treporti, Burano e Torcello)',
    zone: 'Laguna Nord',
    depthRange: '2.5 - 6 metri',
    bestTidePhase: 'Marea montante e cambio al colmo',
    description: 'Zona riparata dal moto ondoso commerciale, caratterizzata da meandri lagunari naturali, bassi fondali e banchi di canestrelli e vongole.',
    targetOrataSize: 'Orate medie (500g - 1.8 kg)',
    coordinates: { lat: 45.498, lng: 12.435 },
    recommendedBaits: ['Bibi fresco', 'Canolicchio', 'Vongola/Cozza'],
    tacticalTip: 'Ottima in primavera avanzata e autunno con venti da Bora o Scirocco moderati che rimescolano l\'acqua nei canali secondari.'
  }
];

export const ORATA_BAIT_GUIDE = [
  {
    name: 'Granchio Verde (Carcinus aestuarii / Moeca)',
    dialetto: 'Granso ripario / Moeca',
    description: 'L\'esca regina indiscussa per le grandi orate della laguna. Seleziona orate di taglia evitando i pesciolini di disturbo.',
    bestConditions: 'Corrente sostenuta, bocche di porto e scalini di barena.',
    hooking: 'Innescato vivo con due ami beak 1/0 - 2/0 sul dorso o privandolo delle pinne posteriori.'
  },
  {
    name: 'Bibi di Chioggia',
    dialetto: 'Bibi indigeno nostrano',
    description: 'Verme coriaceo ricchissimo di fosforo e liquidi attrattivi. Turgido e irresistibile sul fondale sabbioso/fangoso.',
    bestConditions: 'Maree montanti limpide, San Nicolò, Alberoni, Canale dei Petroli.',
    hooking: 'Infilato con ago per bibi senza farlo svuotare del liquido celomatico interno.'
  },
  {
    name: 'Cozza (Mitilo nostrano)',
    dialetto: 'Peòcio lagunare',
    description: 'Il cibo quotidiano naturale dell\'orata in laguna. L\'orata stritola il guscio con i suoi possenti denti molariformi.',
    bestConditions: 'Scogliere delle dighe, palificazioni di briccole, barche ormeggiate.',
    hooking: 'Intera semi-aperta fermata con filo elastico, oppure a spicchio sgusciato per orate più caute.'
  },
  {
    name: 'Cannolicchio (Cappa Longa)',
    dialetto: 'Capalonga de mar',
    description: 'Profumatissimo e visibile. Ottimo in bocca di porto dove la corrente ne porta le essenze verso l\'interno.',
    bestConditions: 'Fondale sabbioso, prime ore di luce o notturna.',
    hooking: 'Fresco e sgusciato su due ami in linea con filo elastico sottile.'
  },
  {
    name: 'Arenicola / Vermara',
    dialetto: 'Verme de fango / Trevisan',
    description: 'Esca micidiale per le giornate di acqua ferma, quadrature o orate iper-sospettose in laguna nord e barene.',
    bestConditions: 'Bassa turbolenza, fondali bassi, primavera.',
    hooking: 'Innescata intera con ago lungo e ami sottili gambo lungo (n. 4 - 6).'
  }
];
