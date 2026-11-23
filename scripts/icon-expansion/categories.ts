import { interfaceIcons } from './interface.ts';
import { fileIcons } from './files.ts';
import { digitalIcons } from './digital.ts';
import { weatherIcons } from './weather.ts';
import { travelIcons } from './travel.ts';
import { mediaIcons } from './media.ts';
import { commerceIcons } from './commerce.ts';
import { scienceIcons } from './science.ts';
import { natureIcons } from './nature.ts';
import { homeFoodIcons } from './home-food.ts';
import { panelIcons } from './atlas/panels.ts';
import tablerRows from './folio/tabler.json' with { type: 'json' };

export const categoryLabels: Record<string, string> = {
  animals:'Animals', buildings:'Buildings & home', communication:'Communication',
  data:'Data & charts', design:'Design & layout', development:'Development',
  devices:'Devices', documents:'Documents & files', finance:'Commerce & finance',
  food:'Food & drink', games:'Games', health:'Health', interface:'Interface',
  media:'Media & audio', nature:'Nature', navigation:'Maps & navigation',
  people:'People & expressions', photography:'Photography', science:'Science & math',
  security:'Security & privacy', sport:'Sports', symbols:'Symbols', text:'Text & typography',
  time:'Time & calendar', transport:'Travel & transport', weather:'Weather', other:'Other',
  arrows:'Arrows & directions', audio:'Music & audio', brands:'Currency & payment',
  calendar:'Dates & scheduling', connectivity:'Networks & connectivity', controls:'Playback controls',
  desktop:'Computers & keyboards', fitness:'Fitness & training', gamesTable:'Cards, dice & tabletop',
  geography:'Landscapes & geography', grids:'Grids & alignment', messaging:'Mail & messaging',
  mobile:'Phones & wearables', outdoor:'Outdoors & recreation', places:'Points of interest',
  rail:'Rail & public transit', shopping:'Shopping & delivery', space:'Space & astronomy',
  status:'Status & alerts', tools:'Tools & maintenance', video:'Video & cinema', wind:'Wind & forecasts',
};

export const categoryGroups = {
  'Interface & design': 'interface arrows controls design grids text symbols status',
  'Technology & work': 'devices desktop mobile connectivity development documents data security time calendar tools',
  'Media & people': 'media audio video photography communication messaging people',
  'Places & nature': 'navigation places transport rail geography nature animals outdoor weather wind space',
  'Everyday life': 'buildings food finance brands shopping health fitness sport games gamesTable science other',
};
const tabler = tablerRows as [string, string, string[]][];
const sourceCategories: Record<string, string> = {
  Animals:'animals nature', Arrows:'interface', Badges:'symbols', Buildings:'buildings',
  Charts:'data', Communication:'communication', Computers:'devices', Currencies:'finance',
  Database:'data development', Design:'design', Development:'development', Devices:'devices',
  Document:'documents', 'E-commerce':'finance', Electrical:'devices', Food:'food', Games:'games',
  Gender:'people symbols', Gestures:'people interface', Health:'health', Laundry:'buildings',
  Logic:'science development', Map:'navigation', Math:'science', Media:'media', Mood:'people',
  Nature:'nature', Photography:'photography media', Shapes:'design symbols', Sport:'sport',
  Symbols:'symbols', System:'interface', Text:'text', Vehicles:'transport',
  'Version control':'development', Weather:'weather nature', Zodiac:'symbols',
};
const defaults = new Map<string, string>();
for (const [icons,id] of [[interfaceIcons,'interface'],[fileIcons,'documents'],[digitalIcons,'devices'],
  [weatherIcons,'weather'],[travelIcons,'transport'],[mediaIcons,'media'],[commerceIcons,'finance'],
  [scienceIcons,'science'],[natureIcons,'nature'],[homeFoodIcons,'buildings'],[panelIcons,'interface devices']] as const) {
  for (const {name} of icons) defaults.set(name,id);
}
for (const [group,name] of tabler) if (sourceCategories[group]) defaults.set(name,sourceCategories[group]);

// Additional meanings are additive, not mutually exclusive. Use anchored families
// where possible so e.g. a card reader isn't classified as a playing card.
const rules = {
  arrows: /^(?:arrows?|chevrons?|double-chevron|corner-(?:up|down)|caret|rotate|swipe|transition)(?:-|$)|^(?:directions?|signpost|expand|collapse|move|fold|selector|refresh(?:-alert|-dot)?|reload|switch(?:-horizontal|-vertical)?|step-(?:into|out))$/,
  audio: /^(?:audio|music|speaker|headphones|microphone|volume|podcast|radio|waveform|equalizer|vinyl|metronome)(?:-|$)|^file-audio$/,
  brands: /^(?:currency|coin|cash|credit-card|payment|banknote|dollar|euro|yen|pound)(?:-|$)/,
  calendar: /^(?:calendar|date|appointment|schedule)(?:-|$)/,
  connectivity: /^(?:wifi|bluetooth|ethernet|antenna|router|modem|network|radio-tower|access-point|mobiledata)(?:-|$)/,
  controls: /^(?:play|pause|stop-circle|record|fast-forward|rewind|skip|shuffle|repeat|remote|jogwheel|softkey|player)(?:-|$)/,
  desktop: /^(?:desktop|computer|monitor|laptop|keyboard|keycap|mouse|workstation)(?:-|$)/,
  fitness: /(?:^|-)(?:dumbbell|barbell|treadmill|gym|gymnastics|yoga|stretching)(?:-|$)/,
  gamesTable: /^(?:card-(?:heart|diamond|club|spade)|die-face|dice|domino|chess|checker)(?:-|$)/,
  geography: /(?:^|-)(?:mountain|mountains|summit|cave|waterfall|island|desert|beach|river|volcano|ocean)(?:-|$)/,
  grids: /^(?:grid|layout|align|columns|rows)(?:-|$)/,
  messaging: /^(?:mail|message|chat|inbox|send)(?:-|$)/,
  mobile: /^(?:phone|handset|smartphone|device-mobile|device-watch|smartwatch|wristwatch|tablet)(?:-|$)/,
  outdoor: /(?:^|-)(?:camping|campsite|picnic|trailhead|lookout|hiking|tent|beach|canoe)(?:-|$)/,
  places: /^(?:amenity|locator|station|sign-(?:east|west))(?:-|$)/,
  rail: /(?:^|-)(?:tram|train|metro|subway|bus|trolleybus)(?:-|$)/,
  shopping: /^(?:cart|shopping|package|basket|delivery|storefront|discount|coupon|gift)(?:-|$)/,
  space: /^(?:rocket|galaxy|planet|orbit|comet|satellite|telescope|ufo|alien)(?:-|$)/,
  status: /^(?:alert|warning|info|success|error|ban|help-circle)(?:-|$)|-(?:accepted|rejected|pending|warning|synced)$/,
  tools: /^(?:toolbox|tool|hammer|wrench|screwdriver|saw|drill|chisel|shovel|tape-measure)(?:-|$)/,
  video: /^(?:video|movie|film|clapperboard|subtitles|cinema|picture-in-picture)(?:-|$)|^file-video$/,
  wind: /^(?:wind-barb|wind|weather-vane|hurricane|tornado|cloud-wind)(?:-|$)/,
  animals: /^(?:paw|animal|cat|dog|bird|fish|bee|butterfly|bug|horse)(?:-|$)/,
  buildings: /(?:^|-)(?:museum|library|stadium|lighthouse|bakery|pharmacy|storefront|station|shelter)(?:-|$)/,
  communication: /^(?:mail|message|chat|phone|phone-call|send|inbox|megaphone|antenna)(?:-|$)/,
  data: /(?:^|-)(?:chart|spreadsheet|database|analytics)(?:-|$)/,
  design: /^(?:grid|layout|align|paintbrush|palette|crop|eraser|ruler)(?:-|$)/,
  development: /^(?:code|terminal|git|api|braces)(?:-|$)|^file-code$/,
  devices: /^(?:keyboard|keycap|handset|laptop|monitor|smartphone|smartwatch|battery|router|printer|camera|webcam|microphone|headphones)(?:-|$)/,
  documents: /^(?:file|folder|clipboard|notebook|archive)(?:-|$)/,
  finance: /^(?:cart|cash|coin|bank|receipt|invoice|currency|credit-card|wallet|shopping)(?:-|$)/,
  food: /(?:^|-)(?:cafe|bakery|dining|coffee|bread|burger|cake|candy|carrot|cooking|croissant|ice-cream|pizza|sandwich|teapot|kettle|restaurant)(?:-|$)/,
  games: /^(?:card-(?:heart|diamond|club|spade)|die-face|domino|dice|chess|puzzle)(?:-|$)/,
  health: /(?:^|-)(?:pharmacy|pill|first-aid|stethoscope|bandage|vaccine|nurse|medical)(?:-|$)/,
  interface: /^(?:arrow|chevron|close|check|menu|search|filter|sort|more|plus|minus|play|pause)(?:-|$)/,
  media: /^(?:remote|player|jogwheel|softkey|music|audio|video|play|pause|film|camera|microphone|headphones|podcast|equalizer|subtitles)(?:-|$)|^file-(?:audio|video)$/,
  nature: /^(?:wind-barb|tree|plant|flower|leaf|mountain|ocean|river|sprout|mushroom)(?:-|$)|(?:^|-)(?:summit|cave|waterfall|orchard|beach)(?:-|$)/,
  navigation: /^(?:amenity|locator|station|sign-(?:east|west)|map|compass|route|signpost|directions|arrow-(?:bear|rotary|ramp|guide))(?:-|$)/,
  people: /^(?:face|mood|user|users|person|hand|woman|man|baby)(?:-|$)/,
  photography: /^(?:camera|webcam|photo|aperture|shutter)(?:-|$)/,
  science: /^(?:atom|molecule|microscope|telescope|beaker|flask|helix|planet|orbit|comet|satellite)(?:-|$)/,
  security: /(?:^|-)(?:lock|shield|protected|private|fingerprint)(?:-|$)|^face-id$/,
  sport: /(?:^|-)(?:dumbbell|basketball|baseball|football|tennis|stadium|swimming)(?:-|$)/,
  symbols: /^(?:flag|heart|star|hash|asterisk|at-sign)(?:-|$)/,
  text: /^(?:text|typography|letter|font|keycap)(?:-|$)/,
  time: /^(?:calendar|clock|date|dial|wristwatch|smartwatch|hourglass|alarm|stopwatch|timer)(?:-|$)/,
  transport: /(?:^|-)(?:car|bus|plane|airplane|train|tram|metro|ferry|parking|runway|bicycle|subway|taxi|scooter|truck|passport|luggage|helicopter)(?:-|$)/,
  weather: /^(?:wind|weather|cloud-(?:rain|snow|sun|moon|fog|hail|drizzle|wind|lightning)|tornado|hurricane|sunrise|sunset|snowflake|rainbow)(?:-|$)/,
};
// Hand-classify general and legacy icons that have no reliable source category.
const legacy = {
  animals:'mickey', buildings:'armchair barrel bath candle desk door elevator home ladder lightbulb shovel chisel wrench',
  communication:'bell rss share social wifi', data:'analyze graph table',
  design:'blob blocks gradienter layers marquee pencil placeholder scale', development:'mobiledata protocol server svg',
  devices:'bulb gizmo key lightbulb mobiledata prong recharging server wifi',
  documents:'bible bookmark briefcase businessplan checklist copy license paperclip save',
  finance:'affiliate exchange box gift moneybag package tag businessplan', food:'avocado grain ladle',
  games:'lego', health:'hospital needle scale',
  interface:'alert-circle alert-triangle ban click copy deselect details direction download edit explicit external-link eye-off eye filters forbid help-circle info label link list maximize outbound refresh reorder replace restore save scan settings share sliders toggle-right trash upload zoom-in zoom-out',
  media:'album metronome volume waveform', nature:'galaxy grain moon sun cell',
  navigation:'direction lane outbound point', people:'friends moustache poo pray smile thumbs-up',
  photography:'image scan screenshot zoom-in zoom-out', science:'alien cell galaxy ikosaedr magnet magnetic moon nut rocket sun',
  security:'eye-off forbid gavel key unlock', sport:'gymnastics snowboarding',
  symbols:'award badge badges balloon blade bolt bomb bong boom coffin confetti crown diamond horseshoe lighter matchstick pentagram point square zap',
  text:'abc braille slash slashes', transport:'balloon jetpack lane lifebuoy propeller rocket',
  weather:'moon snowman sun umbrella',
};
const extra = new Map<string, string[]>();
for (const [id, names] of Object.entries(legacy)) {
  for (const name of names.split(' ')) {
    if (!extra.has(name)) extra.set(name, []);
    extra.get(name)!.push(id);
  }
}
// Correct broad source buckets for individual concepts.
const overrides: Record<string, string> = { 'axis-y':'data', 'step-into':'development interface', 'step-out':'development interface', coffee:'food', bread:'food', pizza:'food', notebook:'documents', bank:'finance buildings', flame:'nature symbols', cloud:'weather nature', activity:'health data', globe:'navigation nature' };
export function categoriesFor(name: string) {
  const family = name.replace(/-(animated|minimalist)$/,'');
  const ids = new Set((Object.hasOwn(overrides,family) ? overrides[family] : defaults.get(family) ?? '').split(' ').filter(Boolean));
  for (const id of extra.get(family) ?? []) ids.add(id);
  for (const [id,pattern] of Object.entries(rules)) if (pattern.test(family)) ids.add(id);
  return ids.size ? [...ids].sort() : ['other'];
}
