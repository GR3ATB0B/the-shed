// Portfolio content for every cluster. Shared by the 3D overlay and the
// accessible DOM mirror so screen readers and crawlers see the same text.
export const CLUSTER_CONTENT = {
  code: {
    title: 'Python & Coding',
    tagline: 'Mostly Python, occasionally Go, always too many tabs.',
    body: [
      'I live in Claude Code. Subagents, MCP servers, agent loops, and whatever physical thing the agent needs to poke at next.',
      'The laptop runs hot from too many concurrent subagents. Worth it.',
    ],
    links: [{ label: 'GitHub @GR3ATB0B', href: 'https://github.com/GR3ATB0B' }],
  },
  electronics: {
    title: 'Electronics',
    tagline: 'Soldering iron temperature: probably too hot.',
    body: [
      'ESP32-based hardware that talks to LLMs. The latest is a physical approval device — a button that hangs off Claude Code and lights up when an agent needs human consent.',
      'BLE keyboards, HID-over-GATT experiments, custom firmware, and the occasional 3D-printed enclosure. The bench rarely gets fully clean.',
    ],
  },
  coffee: {
    title: 'Coffee',
    tagline: 'Nash loves coffee.',
    body: [
      'V60 most mornings. Aeropress on the road. The shop downstairs pulls fine espresso when I cannot be trusted with a grinder.',
      'Favorite roasters this year: Tweed (Decatur), Onyx (Rogers AR), Brash (KC).',
    ],
    links: [
      { label: 'Buy me a coffee', href: 'https://www.buymeacoffee.com/' },
    ],
  },
  photo: {
    title: 'Photography',
    tagline: 'Fujifilm X100T and a Pentax that smells like the 80s.',
    body: [
      'Mostly film, occasionally digital, never anything close to a session. Friends, mountains, the inside of weird rooms.',
    ],
  },
  flower: {
    title: 'Flower Making',
    tagline: 'Wires, paper, patience.',
    body: [
      'Hand-built flowers from crepe paper, wire stems, and the occasional bead. Started as a gift project, kept going because they last forever.',
      'The tulip on the desk is a prototype. The good ones live in jars at my mom\'s house.',
    ],
  },
  camping: {
    title: 'Camping & Fly Fishing',
    tagline: 'Cold water, knots I sort of remember.',
    body: [
      'Backcountry weekends, mountain trout streams, the occasional Gulf flat. The backpack stays mostly packed.',
      'Tackle box has more flies than fish I have ever caught. That ratio is fine.',
    ],
  },
  forging: {
    title: 'Forging & Metal Casting',
    tagline: 'Hammer, anvil, hot metal.',
    body: [
      'I bought an anvil before I knew what to do with one. Now I make knives, hooks, brackets, and the occasional sword that lives on a shelf as a conversation piece.',
      'Casting gold bars is mostly a joke. Mostly.',
    ],
  },
  weights: {
    title: 'Weightlifting',
    tagline: 'Trying to outlift the chair.',
    body: [
      'Powerlifting-flavored programming. Nothing impressive, just consistent. The dumbbells in the corner exist so I do not become my desk.',
    ],
  },
  football: {
    title: 'Football',
    tagline: 'War Eagle.',
    body: [
      'Saturdays in Jordan-Hare are non-negotiable. The ball on the shelf is a leftover from a tailgate I refuse to give back.',
    ],
  },
  rcvehicles: {
    title: 'RC Vehicles',
    tagline: 'Faster than the dog.',
    body: [
      'Bashers, crawlers, a 5" FPV freestyle quad that has been quietly upgraded since freshman year.',
      'The drone on the shelf is a spare frame waiting on a new flight controller.',
    ],
  },
  lego: {
    title: 'LEGO',
    tagline: 'The other hardware platform.',
    body: [
      'Sorted by part, not color. Strong opinions about Technic. The rover on the shelf is a build I finally finished after years of false starts.',
    ],
  },
  brain: {
    title: 'AI Agents',
    tagline: 'There is a brain on my shelf.',
    body: [
      'I build with Claude Code. Subagents, MCP servers, hooks, scheduled routines, the whole bit. The brain on the shelf is the punchline.',
      'Most of what runs on this site, and the hardware on the bench, is wrangled by some flavor of LLM-driven loop. The good ones are the ones you forget are running.',
    ],
    links: [{ label: 'claude-mem', href: 'https://github.com/thedotmack/claude-mem' }],
  },
  music: {
    title: 'Music & Live Sound',
    tagline: 'Sound check at the house of God.',
    body: [
      'Sundays at Passion City on FOH. Weekdays poking at a MIDI keyboard while the agents do their thing in the background.',
      'Mixing, MIDI tinkering, occasional production.',
    ],
  },
  fabrication: {
    title: '3D Printing',
    tagline: 'Filament cost: rounding error. Time saved: significant.',
    body: [
      'Bambu Lab X1C with too many open project files. Mostly fixtures, enclosures, and brackets for the electronics work.',
    ],
  },
  reading: {
    title: 'Reading',
    tagline: 'A running list. Not to brag, dude wrote books on bread.',
    body: [
      'I keep a list of everything I read. Math textbooks, Spanish lit, theology, novels, the occasional engineering text — it is all here.',
      'Currently working through:',
    ],
    list: [
      'Surely You\'re Joking, Mr. Feynman — Richard Feynman',
      'The Pragmatic Programmer — Hunt & Thomas',
      'Mere Christianity — C.S. Lewis',
      'Don Quijote (in Spanish) — Cervantes',
      'Linear Algebra Done Right — Sheldon Axler',
      'On Writing Well — William Zinsser',
    ],
  },
  travel: {
    title: 'Travel',
    tagline: 'The map on the bookshelf.',
    body: [
      'Roadtrips mostly, with the occasional flight. Favorite spots so far: Cohutta Wilderness, the San Juans, Bridger-Teton, Sevilla.',
      'Pins on the map are places I have actually slept, not just driven through.',
    ],
  },
  cross: {
    title: 'Prayer',
    tagline: 'Things you can pray about with me.',
    body: [
      'Faith is the through-line of the whole shed. If you want to pray for or with me, here is what I am praying about lately:',
    ],
    list: [
      'Wisdom for what to build next, and the discipline to finish it.',
      'My family back home — health, peace, and time together.',
      'The Auburn campus and the people who pour into it.',
      'Friends going through hard seasons (you know who you are).',
      'That the work of my hands would actually help somebody.',
    ],
  },
  corkboard: {
    title: 'Bulletin Board',
    tagline: 'Pinned, half-finished, occasionally pursued.',
    fullscreen: true,
    cards: [
      {
        kicker: 'Graduating',
        title: 'May 2026',
        body: 'Auburn EE, B.S. Spent four years building hardware that mostly worked. Open to good problems, weird teams, and any role that involves both bits and atoms.',
      },
      {
        kicker: 'Random thoughts',
        title: 'On building',
        body: 'The thing you keep half-finishing is usually the thing you should finish first. The half-finishing is the lesson.',
      },
      {
        kicker: 'Contact',
        title: 'Say hi',
        body: 'Email is best. I read everything, reply to most.',
        links: [
          { label: 'gr3atb0b@gmail.com', href: 'mailto:gr3atb0b@gmail.com' },
          { label: 'GitHub @GR3ATB0B', href: 'https://github.com/GR3ATB0B' },
        ],
      },
      {
        kicker: 'Send me money',
        title: 'Buy me a coffee',
        body: 'If anything on here made you smile or saved you time, the next V60 is on you.',
        links: [
          { label: 'Buy me a coffee', href: 'https://www.buymeacoffee.com/' },
        ],
      },
      {
        kicker: 'Currently shipping',
        title: 'Claude approval device',
        body: 'Physical button hanging off Claude Code. Lights up when an agent wants permission. Press to approve, ignore to deny. Surprisingly relaxing.',
      },
      {
        kicker: 'Idea I keep returning to',
        title: 'Agent that runs the lab',
        body: 'The shed has cameras, lights, sensors. Eventually an agent should be able to walk into it, find what it needs, and tell me what is missing.',
      },
    ],
  },
};
