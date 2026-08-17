export type ContentStatus = "Published" | "Draft";

export type Story = {
  id: string;
  title: string;
  author: string;
  topic: string;
  status: ContentStatus;
  publishedAt: string;
  /** Main/hero image — referencing the live site's asset URL directly. */
  imageUrl: string;
  /** One-sentence card summary, separate from the full `body`. */
  description: string;
  body: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  pages: string[];
};

export const CURRENT_USER_NAME = "Kyle Brower";

export const availableTopics: string[] = [
  "Community",
  "Events",
  "Volunteering",
  "Announcements",
];

export const availablePages: string[] = [
  "Homepage",
  "About",
  "Events",
  "Committees",
  "Membership",
  "Contact",
];

/** Pulled from mapleleafcommunity.org/leaflet — the 5 most recent live stories, for demo mode. */
export const sampleStories: Story[] = [
  {
    id: "story-visioning-survey",
    title: "Your Maple Leaf Visioning Survey",
    author: "Ethan Delavan",
    topic: "Announcements",
    status: "Published",
    publishedAt: "Feb 22, 2026",
    imageUrl: "https://www.mapleleafcommunity.org/images/leaflet-stories/survey-email-header-2-narrow.png",
    description:
      "Community members are invited to complete a neighborhood visioning survey by March 31 to influence Maple Leaf's future development.",
    body: [
      "<p>Seldom does a chance like this one come your way to share your thoughts with your neighbors on the Maple Leaf Community Council. And it only lasts through March 31. The Maple Leaf Visioning Survey is the work product of many of your neighbors who joined the Zoning Workshops at various sessions last year. And now it's up to you to fulfill its promise!</p>",
      "<p>The Maple Leaf Visioning Survey is a way to do just that. Don't let your voice go unheard. Take 20 minutes to complete the survey and influence the future of our neighborhood.</p>",
      '<p><a href="https://corexmsxqnlfzl6xqdlt.qualtrics.com/jfe/form/SV_ebd1ZA6lxwSASA6">Take the survey</a></p>',
    ].join(""),
  },
  {
    id: "story-housing-types",
    title: "Housing Types",
    author: "Ethan Delavan",
    topic: "Community",
    status: "Published",
    publishedAt: "Jan 31, 2026",
    imageUrl: "https://www.mapleleafcommunity.org/images/leaflet-stories/cohousing-infographic.png",
    description:
      "An overview of common residential building types and their defining characteristics, from apartments to co-housing arrangements.",
    body: [
      "<p>Housing type can take many forms. Here are a few basic types for reference.</p>",
      "<p>Apartment buildings take many shapes. Some have a courtyard in their midst, or a front yard. Others may take up most of the property's footprint, but are near a larger greenspace.</p>",
      "<p>Stacked flats look like apartments from the outside, but each apartment is only one storey, emphasizing accessibility. The building may feature an elevator.</p>",
      "<p>Courtyard blocks include larger apartment buildings around a central yard, taking up most or all of a city block.</p>",
      '<img src="https://www.mapleleafcommunity.org/images/leaflet-stories/cohousing-infographic.png" alt="Infographic comparing residential housing types" />',
      "<p>Townhomes are now a common sight. They are tall, similar units in a row or grid. Most of them share walls, but some of them stand alone with little space in between. Some are designed with live/work capacity in mind.</p>",
      "<p>Row houses are similar, but are marked by slight variations among them on the same footprint, often abutting the sidewalk.</p>",
      "<p>Duplexes and triplexes house more than one family in a building with one owner. They usually feature an entrance for each unit.</p>",
      "<p>Cottage courtyards involve several small houses around a central yard or green-lined path.</p>",
      "<p>Co-housing can take many shapes, often with several buildings. It involves shared amenities and practices.</p>",
      "<p>Multi-generational housing is less about the architectural type, but rather about the building's ability to house one large family of multiple generations.</p>",
      "<p>Multi-income housing is similarly less about the building style than it is about offering enough variety of housing types in one development to accommodate families of different income levels.</p>",
    ].join(""),
  },
  {
    id: "story-silent-book-club",
    title: "A Quiet Way to Belong",
    author: "Alex Benson",
    topic: "Community",
    status: "Published",
    publishedAt: "Jan 8, 2026",
    imageUrl: "https://www.mapleleafcommunity.org/images/community-photos/img-6862.jpg",
    description:
      "A neighbor's initiative brought Silent Book Club to Maple Leaf, demonstrating how community support can transform grassroots ideas into recurring neighborhood gatherings.",
    body: [
      '<p>Silent Book Club represents what unfolds "when a neighbor steps up to create the kind of space they want to see in their neighborhood."</p>',
      "<p>The concept originated simply: a resident approached the Maple Leaf Community Council seeking to establish a Silent Book Club locally. Rather than requiring extensive planning, the Council provided foundational support, enabling the neighbor to transform their vision into reality. This approach exemplifies how the Council operates most effectively — empowering neighbors to build welcoming community spaces.</p>",
      "<p>Over twelve months, Silent Book Club cultivated a steady membership of readers meeting consistently. The group participates in a larger Seattle-wide Silent Book Club network, with Maple Leaf's chapter now firmly established. Meeting locations evolved seasonally, initially gathering in the park and various neighborhood businesses before establishing regular sessions at Watershed during winter and beyond.</p>",
      "<p>The gatherings facilitate meaningful connection. Participants have collectively explored numerous titles while engaging in conversation before and after meetings. Sessions occur every third Sunday monthly with deliberately low-key structure: no mandatory reading assignments, no discussion obligations, and no expectations beyond attending with a book.</p>",
      "<p>The gathering's appeal lies in accessibility. Participation requires only showing up whenever feasible with reading material. For those interested in deeper involvement, support opportunities exist — covering for organizers, promoting events, or simply maintaining a welcoming presence.</p>",
      '<p>Community building, the Council suggests, "doesn\'t always have to be loud or structured. Sometimes it\'s built quietly, page by page, through shared time and familiar faces."</p>',
      "<p>An outreach event on January 11 offers opportunities to join or support Silent Book Club and other community initiatives.</p>",
    ].join(""),
  },
  {
    id: "story-love-your-neighbor",
    title: "Conversations Close to Home",
    author: "Alex Benson",
    topic: "Community",
    status: "Published",
    publishedAt: "Jan 7, 2026",
    imageUrl: "https://www.mapleleafcommunity.org/images/community-photos/love-your-neighbor.webp",
    description:
      "A local community council created an informal adult gathering called Love Your Neighbor to address neighbors' desires for casual social connection outside of family-oriented events.",
    body: [
      "<p>Community doesn't look the same for everyone.</p>",
      "<p>Maple Leaf is home to many families, and over the years the Maple Leaf Community Council has supported a lot of events built with children in mind. Those gatherings matter, and they'll always be part of what we do. At the same time, we've heard from neighbors who were looking for something different. A place to gather that wasn't centered on kids. A space to meet people, talk, and get to know one another more casually.</p>",
      "<p>Love Your Neighbor grew out of that need.</p>",
      "<p>Created by members of the Outreach Committee, this wintertime event was designed as a simple way for adults to come together. It's intentionally low-key. A happy hour of sorts. No programming. No agenda. Just neighbors showing up, grabbing a drink, and spending time together.</p>",
      "<p>We've hosted Love Your Neighbor at Project 9, alongside other seasonal gatherings supported by the Maple Leaf Community Council. Whether it's winter or summer, the goal stays the same: create a welcoming space where people can show up as they are and feel part of the neighborhood.</p>",
      "<p>What makes Love Your Neighbor special is that it didn't come from a long-standing tradition. It came from neighbors noticing a gap and stepping up to fill it. The Maple Leaf Community Council supported the idea, helped with coordination and promotion, and made space for it to grow. The rest happened naturally.</p>",
      "<p>This year marks the third year of Love Your Neighbor, and it continues to bring together people who may not have otherwise crossed paths. It's a reminder that community doesn't always need structure. Sometimes it just needs a place to sit, talk, and feel welcome.</p>",
      "<p>If you're interested in helping support Love Your Neighbor, there are easy ways to get involved. Whether that's helping organize, being a friendly face at the event, or assisting with outreach, it's one of the most approachable ways to step into community involvement.</p>",
    ].join(""),
  },
  {
    id: "story-movies-by-the-tower",
    title: "Building Connections Under the Stars",
    author: "Alex Benson",
    topic: "Events",
    status: "Published",
    publishedAt: "Jan 5, 2026",
    imageUrl: "https://www.mapleleafcommunity.org/images/community-photos/movies-tower.webp",
    description:
      "One neighbor's initiative to host outdoor movie nights evolved into a beloved community event attracting thousands of attendees annually.",
    body: [
      "<p>At the start of any new year, there's a familiar question that comes up. What could this neighborhood be if we tried something new?</p>",
      "<p>Movies by the Tower in Maple Leaf began with one neighbor asking that exact question.</p>",
      '<p>The idea came from Billy, who wanted to host an outdoor movie night with the folks at Scarecrow Video. He didn\'t wait for a committee or a plan. He took the initiative and ran the first one himself. When he reached out to see if the Maple Leaf Community Council might want to sponsor the event, they were delighted to say yes.</p>',
      "<p>That summer, the neighborhood had failed to bring back the Summer Social. Movies by the Tower filled that gap in the simplest way possible — one night with a couple hundred people, a small popcorn maker, an inflatable projector, and neighbors gathered as the sun set on a warm August evening. It was informal, imperfect, and exactly what people needed.</p>",
      "<p>Partnering with the Maple Leaf Community Council, Billy helped turn Movies by the Tower into one of the premier summer events. What started as a single evening grew into a series of three movie nights. Over the past three years, the event has continued to evolve as neighbors and volunteers added ideas and energy.</p>",
      '<img src="https://www.mapleleafcommunity.org/images/community-photos/movies-tower.webp" alt="Neighbors gathered on the lawn for Movies by the Tower" />',
      "<p>A beer garden was introduced through partnerships with local breweries and restaurants like Project 9 and Growler Guys. The original popcorn stand grew into three rotating food vendors offering ice cream, empanadas, and wood-fired pizza. Trivia, musical performances, and spotlights on local businesses became part of the experience.</p>",
      "<p>Attendance grew significantly — from a few hundred neighbors to more than 4,000 attendees across the season. Surprises included a massive turnout for <em>Barbie</em> that was rained out just as the film started, and creative experiments like a silent film scored and performed live with classical instruments.</p>",
      "<p>Throughout this growth, Scarecrow Video has been a key partner, and dozens of volunteers have supported planning, setup, food coordination, and day-of logistics.</p>",
    ].join(""),
  },
];

export const sampleFaqs: Faq[] = [
  {
    id: "faq-1",
    question: "How do I renew my membership?",
    answer: "Renewals open every January and can be completed online from your account page.",
    pages: ["Membership", "Homepage"],
  },
  {
    id: "faq-2",
    question: "Who do I contact about a committee?",
    answer: "Each committee page lists its chair's contact information under the Committees section.",
    pages: ["Committees", "Contact"],
  },
  {
    id: "faq-3",
    question: "Where can I find upcoming events?",
    answer: "All upcoming events are listed on the Events page, with sign-up links where applicable.",
    pages: ["Events", "Homepage"],
  },
];
