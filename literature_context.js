/**
 * literature_context.js
 * Verified Core Plots, Characters, and Thematic Summaries for CBSE & NEP 2020 Textbooks.
 * Injected dynamically into AI prompts to prevent plot hallucination on newly introduced textbooks
 * (e.g. Kaveri for Class 9 English, Ganga for Class 9 Hindi, Poorvi for Classes 6, 7 & 8,
 * and the Class 10-12 English readers).
 */

export const LITERATURE_SUMMARIES = {
  // ==========================================
  // CLASS 9 ENGLISH — KAVERI (NCERT NEP 2020)
  // ==========================================
  // Eight units, each one prose piece + one poem. These summaries were first
  // written from the chapter titles alone and were wrong for most chapters
  // (Winds of Change as "social reform", Vitamin-M as "money", Canvas of Soil
  // as "the peasant's toil"...), and the AI faithfully set questions on them.
  // Every entry below is checked against the book; keep it that way.
  "how i taught my grandmother to read": {
    title: "How I Taught My Grandmother to Read (Sudha Murty)",
    type: "Prose",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 1. Sudha Murty recalls how, at about twelve, she taught her grandmother Krishtakka (about 62) to read Kannada. Krishtakka followed Triveni's serialised novel 'Kashi Yatre' in the weekly magazine 'Karmaveera' by having Sudha read it aloud; when Sudha went away to a wedding in another village and came back, she found her grandmother in tears because she could not read the instalment herself and felt helpless and dependent. Krishtakka resolved to learn the alphabet, practised with great determination and read the novel on her own before the Dasara deadline she had set; on Vijayadashami she touched Sudha's feet, honouring her as her teacher. Themes: it is never too late to learn, the dignity of literacy, respect for a teacher regardless of age, the grandmother-granddaughter bond."
  },
  "the pot maker": {
    title: "The Pot Maker (Temsula Ao)",
    type: "Prose",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 2. Sentila, a young Ao Naga girl, wants to become a potter like her mother Arenla and her grandmother. Arenla wants her to learn weaving instead, because pot making is exhausting and poorly paid: the clay is fetched from a distant riverbank, pounded and fired in a kiln, all for very little money, and she wants to spare her daughter that hardship. Sentila keeps watching the expert potters and practising, guided by Onula, a kind widow who supervises the girls' dormitory and helps her shape the mouth of the pot. Through years of patience she masters the craft and Arenla comes to accept her calling. Themes: passion and perseverance, a mother's protective love, traditional crafts as the heritage of a whole community passed down the generations. The mother's objection is about hardship and poor earnings, NOT a tribal or clan taboo on women making pots; do not frame the story as defying taboos or gender prohibitions."
  },
  "winds of change": {
    title: "Winds of Change (Gaatha)",
    type: "Prose",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 3. An expository article (from Gaatha, a crafts archive; no named author) on the traditional Indian hand fan, the pankha: the origin of the word, its history, regional variations in design and materials across India, and how the fan changed from an essential everyday object into a ceremonial and decorative craft piece once electric fans and modern technology arrived. Themes: regional craftsmanship, indigenous materials, cultural identity and the need to preserve traditional crafts. It is NOT about social or educational reform in history."
  },
  "vitamin m": {
    title: "Vitamin-M (Asha Nehemiah)",
    type: "Prose",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 4. A humorous story by Asha Nehemiah. Ravi's elderly grandfather comes to live with the family; Ravi's mother Vidya worries about his failing memory, wishes there were a 'Vitamin-M' for memory, and asks Ravi to keep an eye on him during the holidays. Grandpa hates being treated like a child and insists on going out alone, so Ravi secretly follows him and lands in a series of funny, embarrassing situations. In the end it is Vidya who has forgotten Grandpa's birthday, and Grandpa gives Ravi a detective book, showing he knew all along that he was being followed. Themes: the dignity and independence of the elderly, understanding and patience in the family, old age is not incompetence. It is NOT about money, wealth or materialism."
  },
  "the world of limitless possibilities": {
    title: "The World of Limitless Possibilities",
    type: "Prose",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 5. An interview with Dr Deepa Malik, the Indian para-athlete. A spinal tumour left her paralysed below the waist at 29; she went on to become the first Indian woman to win a Paralympic medal (Rio 2016) and received the Khel Ratna and the Padma Shri. She speaks about choosing possibilities over regret, and about disability as a different ability rather than a limitation. Themes: resilience, determination, inclusion, the Paralympic spirit (paired with the poem 'Nine Gold Medals')."
  },
  "twin melodies": {
    title: "Twin Melodies (Mitra Phukan)",
    type: "Prose",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 6. A play by Mitra Phukan. Shruti Sharma, a talented young violinist, secretly plays Indo-Western fusion music with her friends Iqbal (flute), Avinash (tabla) and Peter (keyboard), afraid of the disapproval of her father, Guru Nabin Sharma, a strict Hindustani classical musician. She finds the courage to tell him the truth, and he comes to see that music in all its forms deserves respect. Themes: tradition and innovation can coexist, honest communication, courage to follow one's passion, understanding between parents and children."
  },
  "carrier of words": {
    title: "Carrier of Words",
    type: "Prose",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 7. A prose piece (no named author) about Khetaram, a Gramin Dak Sewak who delivers mail across the Thar Desert in Rajasthan. Through searing heat and endless sand dunes he carries letters, news and the money orders many desert families depend on. Themes: the unsung heroes of India Post, duty and dedication, letters and words as lifelines that connect people (paired with the poem 'Words'). It is NOT about Himalayan or forest dak runners."
  },
  "follow that dream": {
    title: "Follow That Dream (Irene Chua)",
    type: "Prose",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 8. A letter dated 19 June 1995 from Irene Chua to her teenage daughter Ming, from the collection 'My Daughter, My Friend'. The mother urges Ming to pursue her dreams, but explains that dreams come true only with passion, planning, discipline, hard work and sacrifice; what separates greatness from the ordinary is the effort invested, and a world-class standard in any field takes about ten years of intense, single-minded dedication. Themes: ambition, perseverance, self-belief, a parent's guidance."
  },

  // Class 9 Kaveri (Poems)
  "bharat our land": {
    title: "Bharat Our Land (Subramania Bharati)",
    type: "Poem",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 1 poem. A patriotic poem celebrating India: the Ganga, the snow-crowned Himalayas, the Upanishads, its heroes and sages, and its cultural glory, with pride in the land and a call to national unity."
  },
  "gifts of grace honouring our vocations": {
    title: "Gifts of Grace: Honouring Our Vocations",
    type: "Poem",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 2 poem (poet not named in the book). Praises the workers and craftspersons of Bharat one by one: the farmer, the carpenter who shapes wood with exact measurements, the electrician who brings light, the boatmen who sing as they gather their nets and sail, the shoemaker who makes sure the shoes are well made, the cook whose food pleases like music, and the designers and masons who celebrate their creations. Every vocation has its own skill, identity and purpose and serves society. Theme: the dignity of labour and respect for every kind of work."
  },
  "canvas of soil": {
    title: "Canvas of Soil (Maya Anthony)",
    type: "Poem",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 3 poem, three stanzas. The poet compares a garden to a work of art: the soil is a painter's palette, rich and full of colour and possibility; planting seeds is like making brushstrokes on a canvas; the gardener waits patiently for spring to bring colour and bloom; in the hands of those who till the soil, gardens become paintings. Theme: gardening as art, the link between nature, creativity and patient care. It is about a gardener and a garden as a painting, NOT about a peasant's or farmer's struggle and toil."
  },
  "i cannot remember my mother": {
    title: "I Cannot Remember My Mother (Rabindranath Tagore)",
    type: "Poem",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 4 poem. The speaker cannot remember his mother's face, yet she returns through the senses: the tune of a song she hummed while rocking his cradle hovers over his playthings, the scent of shiuli flowers on an autumn morning brings back the smell of the temple worship, and when he looks at the sky from his bedroom window he feels her gaze. Themes: memory, loss and a mother's lasting presence."
  },
  "nine gold medals": {
    title: "Nine Gold Medals (David Roth)",
    type: "Poem",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 5 poem. At the Special Olympics nine athletes line up for the hundred-metre race; when one stumbles and falls, the other eight turn back to help him, and they cross the finish line together, arm in arm, so the organisers give out nine gold medals. Themes: empathy, compassion, true sportsmanship, winning together."
  },
  "a friend found in music": {
    title: "A Friend Found in Music (Bryanna T. Perkins)",
    type: "Poem",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 6 poem, three stanzas: music as an ocean and a rhythm, music as therapy, and music as a faithful friend who is always there. Music comforts the speaker in hard times and adds to moments of joy."
  },
  "words": {
    title: "Words (Charles Swain)",
    type: "Poem",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 7 poem by the English poet Charles Swain. Words often fail to satisfy the real needs of the heart: the poet compares empty words to summer birds that come and go and leave nothing behind, and calls the heart a pilgrim that finds them as useless as weeds when it is truly in need. A voice that cheers a lonely home says very little, yet those few sincere words are precious; many hollow words are like plants that blossom but bear no fruit. Message: a few sincere, heartfelt words are worth far more than many meaningless ones (quality over quantity)."
  },
  "believe in yourself": {
    title: "Believe in Yourself (Robert Langley)",
    type: "Poem",
    book: "Kaveri",
    grade: "Class 9",
    summary: "Unit 8 poem. Encourages the reader to face challenges with courage instead of staying in the comfort zone: the future depends on the choices we make today; the first step towards any goal is the hardest, but once it is taken there is no turning back; believing in oneself overcomes fear and doubt and keeps one moving towards one's dreams."
  },

  // ==========================================
  // CLASS 9 HINDI — GANGA (NCERT NEP 2020)
  // ==========================================
  "दो बैलों की कथा": {
    title: "दो बैलों की कथा (प्रेमचंद)",
    type: "Prose",
    book: "Ganga",
    grade: "Class 9",
    summary: "झूरी के दो निष्ठावान बैल (हीरा और मोती) अपनी स्वतंत्रता और स्वाभिमान के लिए गया के क्रूर अत्याचारों, कांजीहौस की कैद और कसाई के चंगुल से संघर्ष करते हैं; पशुओं के परस्पर भावात्मक संबंध, आत्मसम्मान और भारतीय स्वाधीनता संग्राम की प्रतीकात्मक अभिव्यक्ति है।"
  },
  "क्या लिखूँ": {
    title: "क्या लिखूँ? (पदुमलाल पुन्नालाल बख्शी)",
    type: "Prose",
    book: "Ganga",
    grade: "Class 9",
    summary: "लेखक निबंध रचना की जटिल मानसिक प्रक्रिया, विचारों के द्वंद्व और विषय चयन की उलझनों पर मनोरंजक, आत्मपरक और विचारोत्तेजक चिंतन प्रस्तुत करते हैं; शैली की सरलता और गंभीर वैचारिकता का अनूठा संगम है।"
  },
  "संवादहीन": {
    title: "संवादहीन (शेखर जोशी)",
    type: "Prose",
    book: "Ganga",
    grade: "Class 9",
    summary: "पर्वतीय ग्रामीण जनजीवन, आर्थिक विवशता और मानवीय रिश्तों में घटते संवाद व बढ़ते अकेलेपन की गहरी पीड़ा को संवेदनशीलता के साथ उजागर करने वाली कहानी।"
  },
  "ऐसी भी बातें होती हैं लता मंगेशकर से बातचीत": {
    title: "ऐसी भी बातें होती हैं - लता मंगेशकर से बातचीत (यतींद्र मिश्र)",
    type: "Prose",
    book: "Ganga",
    grade: "Class 9",
    summary: "स्वर कोकिला लता मंगेशकर के सुदीर्घ संगीत सफर, कठिन रियाज़, व्यक्तिगत सादगी और शास्त्रीय व सुगम संगीत के प्रति उनकी निष्काम साधना और समर्पण को रेखांकित करता साक्षात्कार।"
  },
  "आखिरी चट्टान तक": {
    title: "आखिरी चट्टान तक (मोहन राकेश)",
    type: "Prose",
    book: "Ganga",
    grade: "Class 9",
    summary: "कन्याकुमारी के अद्भुत प्राकृतिक सौंदर्य, तीन समुद्रों के संगम, मनोहारी सूर्योदय व सूर्यास्त के रंगों और मानवीय मन की दार्शनिक जिज्ञासा का जीवंत यात्रा-वृत्तांत।"
  },
  "रीढ़ की हड्डी": {
    title: "रीढ़ की हड्डी (जगदीशचंद्र माथुर)",
    type: "Prose",
    book: "Ganga",
    grade: "Class 9",
    summary: "सुशिक्षित स्वाभिमानी युवती उमा को देखने आए दकियानूसी गोपाल प्रसाद और उनके चरित्रहीन पुत्र शंकर के पाखंड पर तीखा प्रहार; नारी शिक्षा, आत्मसम्मान और सामाजिक रूढ़ियों के विरुद्ध लिखा गया प्रसिद्ध एकांकी।"
  },
  "मैं और मेरा देश": {
    title: "मैं और मेरा देश (कन्हैयालाल मिश्र प्रभाकर)",
    type: "Prose",
    book: "Ganga",
    grade: "Class 9",
    summary: "लेखक स्वामी रामतीर्थ और जापानी युवक के दृष्टांत से स्पष्ट करते हैं कि प्रत्येक नागरिक का व्यक्तिगत आचरण, ईमानदारी और शिष्टाचार ही राष्ट्र के गौरव और प्रतिष्ठा का निर्धारण करता है।"
  },
  "रैदास के पद": {
    title: "रैदास के पद (रैदास)",
    type: "Poem",
    book: "Ganga",
    grade: "Class 9",
    summary: "प्रभु और भक्त के अटूट, अद्वैत संबंध को 'प्रभु जी तुम चंदन हम पानी' रूपकों द्वारा व्यक्त किया गया है; बाह्य आडंबरों और जाति-पांति के भेदभाव से परे शुद्ध प्रेम और समर्पण का संदेश।"
  },
  "राम लक्ष्मण परशुराम संवाद": {
    title: "राम-लक्ष्मण-परशुराम संवाद (तुलसीदास)",
    type: "Poem",
    book: "Ganga",
    grade: "Class 9",
    summary: "शिवधनुष टूटने के पश्चात परशुराम के भीषण क्रोध, लक्ष्मण के व्यंग्यपूर्ण व तीखे वचनों और श्रीराम के विनम्र व शांत आचरण का वीर और रौद्र रस से ओत-प्रोत जीवंत काव्य।"
  },
  "भारती जय विजय करो": {
    title: "भारती, जय, विजय करो! (सूर्यकांत त्रिपाठी निराला)",
    type: "Poem",
    book: "Ganga",
    grade: "Class 9",
    summary: "माँ सरस्वती और पावन भारतभूमि की वंदना करते हुए अज्ञान, जड़ता और पराधीनता के अंधकार को मिटाकर अमर ज्ञान, नूतन चेतना और स्वतंत्रता का दिव्य प्रकाश फैलाने का ओजस्वी आह्वान।"
  },
  "झाँसी की रानी": {
    title: "झाँसी की रानी (सुभद्रा कुमारी चौहान)",
    type: "Poem",
    book: "Ganga",
    grade: "Class 9",
    summary: "1857 के प्रथम स्वतंत्रता संग्राम में वीरांगना लक्ष्मीबाई के अद्वितीय शौर्य, मातृभूमि प्रेम और अंग्रेजों के विरुद्ध रणभूमि में किए गए अदम्य युद्ध का वीर रस से परिपूर्ण अमर काव्य।"
  },
  "घर की याद": {
    title: "घर की याद (भवानी प्रसाद मिश्र)",
    type: "Poem",
    book: "Ganga",
    grade: "Class 9",
    summary: "1942 के भारत छोड़ो आंदोलन के दौरान जेल में बंद कवि को सावन की रिमझिम फुहारों के बीच अपने स्नेहशील माता-पिता और भाई-बहनों की मार्मिक स्मृति आती है; पारिवारिक आत्मीयता और देशभक्ति का संगम।"
  },

  // ==========================================
  // CLASS 6, 7 & 8 ENGLISH — POORVI (NCERT NEP 2020)
  // ==========================================
  // Class 7 had no entries at all, so the AI made the chapters up: a Class 7
  // paper set "The Day the River Spoke" on a girl called Janu with polio and
  // crutches, and quoted the wrong "Try Again" poem. The Class 6 and Class 8
  // entries had been written from the chapter titles (A Concrete Example as
  // building infrastructure, The Magic Brush of Dreams as a prose folktale,
  // A Bottle of Dew with a "Ramaiah" and his father-in-law). Every entry below
  // is checked against the book; keep it that way, and name a common wrong
  // reading where the AI is known to make one.

  // Class 8 Poorvi
  "the wit that won hearts": {
    title: "The Wit that Won Hearts",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 1. A Tenali Ramakrishna story set in the Vijayanagara court of King Krishnadeva Raya. The queen, Thirumalambal, yawns out of tiredness while the king is reciting his poem; he takes it as an insult and stops speaking to her. The unhappy queen asks Tenali for help. Tenali comes to court with paddy seeds and says they would give a wonderful harvest if sown by someone who has never yawned in his life; the king says no such person exists, sees his own mistake, apologises to the queen and the two are reconciled. Themes: wit and presence of mind, correcting a powerful person tactfully, pride and forgiveness."
  },
  "a concrete example": {
    title: "A Concrete Example (Reginald Arkell)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 1 poem. A humorous poem about the speaker's next-door neighbour, Mrs Jones, whose garden is almost all stone: a crazy path, a lily pond, a rockery and a sundial, with tiny plants tucked between the stones that the speaker jokes she must plant with a pin. She invites the speaker over to admire one rare flower, and after a long talk about it reveals that the speaker has been standing on it all the time. Light verse; the title is a pun on concrete (stone). It is NOT about science, engineering or building infrastructure."
  },
  "wisdom paves the way": {
    title: "Wisdom Paves the Way",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 1. A play. Four young men, Ram Datt, Shiv Datt, Har Datt and Dev Datt, travelling to Ujjain, study the tracks of an animal on the road and work out the details of a camel they have never seen. A merchant who has lost his camel hears them describe it exactly and accuses them of stealing it. Before the king they explain how each conclusion came from careful observation and reasoning; the king, impressed, sets them free and makes them his advisers. Themes: observation, logical reasoning, wisdom over hasty judgement."
  },
  "a tale of valour major somnath sharma and the battle of badgam": {
    title: "A Tale of Valour: Major Somnath Sharma and the Battle of Badgam",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 2. The story of Major Somnath Sharma, the first recipient of the Param Vir Chakra (awarded posthumously). In 1947 his D Company of the 4th Battalion, the Kumaon Regiment, was flown to Kashmir; though his left hand was in plaster he insisted on going with his men. On 3 November 1947 at Badgam, near Srinagar airfield, his company of about ninety men was attacked by several hundred raiders. He held the position, sending the message that the enemy was only fifty yards away, they were heavily outnumbered, and he would not withdraw an inch but fight to the last man and the last round. He was killed by a mortar shell, but his men held on for hours until reinforcements arrived, saving the airfield and Srinagar. Themes: courage, duty, leadership, sacrifice for the nation."
  },
  "somebody s mother": {
    title: "Somebody's Mother (Mary Dow Brine)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 2 poem. On a cold winter day an old, poor woman waits at a busy, snowy street crossing, afraid to cross. Schoolboys rush past laughing; one boy stops, gently helps her across, and goes back to his friends saying she is somebody's mother, and he hopes someone will help his own mother if she is ever old, poor and far away. That night the old woman prays for the kind boy, who is 'somebody's son'. Themes: kindness and respect for the elderly, empathy."
  },
  "verghese kurien i too had a dream": {
    title: "Verghese Kurien – I Too Had a Dream",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 2. Written as a letter from Dr Verghese Kurien to his grandson Siddharth (drawn from his memoir 'I Too Had a Dream'). Trained as an engineer, Kurien came to Anand in Gujarat almost by chance, chose to stay and serve the dairy farmers there, and built the farmers' cooperative movement that became Amul; Operation Flood carried the Anand model across India and made India the world's largest milk producer (the White Revolution). He tells his grandson that a life of integrity, hard work and service to others is the most satisfying one. Themes: service, integrity, cooperation, empowering farmers."
  },
  "the case of the fifth word": {
    title: "The Case of the Fifth Word (Donald J. Sobol)",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 3. An Encyclopedia Brown mystery. Leroy 'Encyclopedia' Brown, a boy detective in Idaville, helps his father, Chief Brown of the police. Two men, Nolan and Davenport, are suspected of a hold-up; Davenport disappears and Nolan dies leaving a puzzling coded message written on his desk calendar, meant to tell his partner where the loot is hidden. Encyclopedia works out the message and asks a single question: is there a young fir tree in Nolan's palm-tree nursery? There is, and that is where the money is. Themes: observation, logical deduction, wordplay."
  },
  "the magic brush of dreams": {
    title: "The Magic Brush of Dreams",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 3 poem (a narrative poem, not a prose story). A poor girl, Gopi, receives a magic brush: whatever she paints comes to life. Remembering that the brush is meant for the poor, she paints food, clothes and tools for the needy villagers. A greedy Zamindar hears of it and orders her to paint riches for him; she outwits him, painting a river and a beast that stop his chase. Themes: using one's gifts for others, imagination, honesty against greed."
  },
  "spectacular wonders": {
    title: "Spectacular Wonders",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 3. An informative piece on seven natural wonders of India: the Valley of Flowers (Uttarakhand), the living root bridges of Meghalaya (grown by the local people from the roots of rubber trees), Lonar Crater Lake in Maharashtra (formed by a meteorite impact), the magnetic hill (Ladakh), the glowing waters of Kerala (bioluminescent micro-organisms, e.g. at Kumbalangi), the Sundarbans mangroves, and Chandipur beach in Odisha, where the sea recedes for kilometres at low tide. Themes: the natural wonders of India, curiosity, conservation. It is about natural wonders in India, NOT the man-made wonders of the world."
  },
  "the cherry tree": {
    title: "The Cherry Tree (Ruskin Bond)",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 4. Rakesh, about six, lives with his grandfather on the outskirts of Mussoorie and goes to school there. Coming home with cherries from the bazaar, he plants a seed in the garden. The little tree survives a hungry goat, a grass-cutter's scythe that cuts it in two, and the monsoon and winter, growing back each time with Rakesh watering and caring for it. Years later it blossoms and bears a few cherries, and Rakesh lies in its shade, wondering at the life in it because he planted it himself. Themes: patience, nurturing nature, the resilience of life, the bond between grandfather and grandson."
  },
  "harvest hymn": {
    title: "Harvest Hymn (Sarojini Naidu)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 4 poem. A hymn of thanksgiving sung at harvest by the voices of men, women and all together: they praise Surya, the sun god, for ripening the crops, Varuna, the god of rain, for the showers that sustain them, and Prithvi, the Earth Mother, for nourishing all creatures, and give thanks for the harvest. Themes: gratitude to nature, the bond between farmers and the earth, Indian harvest traditions."
  },
  "waiting for the rain": {
    title: "Waiting for the Rain",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 4. Velu, a hardworking farmer who never takes a day off from his land, watches the sky every day in a year of drought while his fields crack and dry. Some villagers turn to astrologers and rituals. Resting under a tree, he meets a wise, gentle old woman who tells him that the land, like people, sometimes needs rest, and that he must be patient and trust nature's rhythm. As he accepts this, the rain comes. Themes: patience, hope, respect for nature's cycles."
  },
  "feathered friend": {
    title: "Feathered Friend (Arthur C. Clarke)",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 5. A science-fiction story told by a crew member of a space station under construction. Sven Olsen, a construction worker, secretly brings a canary, Claribel, on board; she adapts to weightlessness and becomes the crew's pet. One morning she is found unconscious and recovers with oxygen; the narrator himself has a headache. They realise the air supply has failed: the carbon-dioxide purifier had broken down and the alarm had not gone off. Like the canaries miners once took down coal mines, Claribel's fainting warned them in time and saved the crew; after that every space station kept canaries. Themes: science and curiosity, observation, human-animal companionship."
  },
  "magnifying glass": {
    title: "Magnifying Glass (Walter de la Mare)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 5 poem. Through a round magnifying glass the speaker finds wonders in tiny ordinary things: countless shells in a scrap of chalk, a forest of flowers and trees in an inch of moss, a drop of water as busy as a hive of bees, and the delicate parts of small creatures such as a spider. Themes: curiosity, close observation, the marvels hidden in small things."
  },
  "bibha chowdhuri the beam of light that lit the path for women in indian science": {
    title: "Bibha Chowdhuri: The Beam of Light that Lit the Path for Women in Indian Science",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 8",
    summary: "Unit 5. The life of Bibha Chowdhuri, India's first woman particle physicist. She studied physics at Calcutta University when very few women did, and at the Bose Institute worked with D. M. Bose on cosmic rays, using photographic plates exposed at high altitudes (such as Darjeeling) to detect sub-atomic particles called mesons and estimate their mass. She earned her PhD in Manchester under P. M. S. Blackett, and later worked at the Tata Institute of Fundamental Research and the Physical Research Laboratory. Her work went largely unrecognised in her lifetime; in 2019 a star was named 'Bibha' in her honour. Themes: women in science, perseverance, curiosity."
  },

  // Class 7 Poorvi
  "the day the river spoke": {
    title: "The Day the River Spoke (Kamala Nair)",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 1. Jahnavi, a bright, curious girl of nearly ten in a coastal village, longs to go to school. Her older siblings Gopi and Meena go to school, but she must stay home and look after her younger siblings Ramu and Appu while her parents work in the fields, and she fears she is now too old to start. Crying by the river one day, she hears the River speak to her in a sleepy, kind voice; it listens to all she wants to learn about (spiders, bamboo, frogs, the moon), tells her that little girls can do as much as little boys, and advises her to slip quietly into the school with Appu and sit in the class to see whether the teacher lets her stay. She does, and listens to a lesson about Emperor Ashoka; the kind teacher welcomes her, visits her home and persuades her father to let her study, and her mother, who had once wished to study herself, supports her. Jahnavi resolves to become a teacher so that every girl in her village can go to school. Themes: girls' education, courage to ask, nature as a friend. Jahnavi has NO disability (no polio, no crutches), and there is no character called Janu."
  },
  "try again": {
    title: "Try Again (Eliza Cook)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 1 poem. A narrative poem by Eliza Cook about King Bruce of Scotland. Defeated and in despair after failing again and again in a great task for his people, the king lies alone and watches a spider trying to climb its thread and spin its web. It falls again and again but never gives up, and at last it succeeds. Bruce cries 'Bravo!', praising the spider for having 'defied despair', takes heart, tries again and wins. Moral: perseverance; never give up after failure. This is NOT the proverb poem beginning 'Tis a lesson you should heed, / Try, try again; / If at first you don't succeed' (often credited to William Edward Hickson): never quote, extract or name that poem or poet for this chapter."
  },
  "three days to see": {
    title: "Three Days to See (Helen Keller)",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 1. An essay by Helen Keller, who was blind and deaf, imagining what she would do with three days of sight. She explains how much she already enjoys the world through touch (the shape of a leaf, the bark of a tree). On the first day she would look at the people whose kindness and friendship have made her life worth living, looking into their eyes and faces, which she has only known by touch; on the second day she would watch the sunrise and visit museums to see the history of the earth and of human art; on the third day she would watch ordinary people going about their daily life in the city. She urges those who can see to use their eyes, and all their senses, as if they would lose them tomorrow. Themes: gratitude for the senses, observation, resilience."
  },
  "animals birds and dr dolittle": {
    title: "Animals, Birds, and Dr. Dolittle (Hugh Lofting)",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 2. From 'The Story of Doctor Dolittle'. Dr John Dolittle, a kind but unusual doctor, loses his human patients because his house is full of pets. The Cat's-meat Man suggests he become an animal doctor, and his parrot Polynesia tells him the secret that animals have their own languages: they talk not only with sounds but with their ears, feet, tails and noses (his dog Jip twitching one side of his nose is asking whether the rain has stopped). Polynesia teaches him bird and animal language, and he becomes a famous animal doctor whom creatures come from far away to consult. Themes: humour, empathy and listening, kindness to animals, open-mindedness."
  },
  "a funny man": {
    title: "A Funny Man (Natalie Joan)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 2 poem. A nonsense poem: the speaker meets a funny man in the street who wears a shoe on his head and hats on his feet, offers a 'rose' that turns out to be a currant bun, and sings a funny song; when the speaker asks why he dresses that way, he turns away and hops home on his head. Themes: humour, nonsense, imagination, accepting people who are different."
  },
  "say the right thing": {
    title: "Say the Right Thing",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 2. A humorous one-act play set in Lanfield. Mrs Shaw has invited her new neighbour Mrs Harding and Mrs Lee (Mr Harding's sister, staying with the Hardings) to her home, and warns her talkative daughter Mary to be polite and say nothing that could offend them. Mary means well, but one blunder follows another: blunt, tactless remarks and wrong guesses about the guests' children, clothes, habits and pets embarrass her mother and the visitors, and every attempt to put things right makes them worse. Themes: tact and good manners, thinking before speaking, humour of social situations. Mary's blunders come from being too frank and tactless, NOT from trying to sound grand or sophisticated."
  },
  "my brother s great invention": {
    title: "My Brother's Great Invention (Anita Rau Badami)",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 3. Narrated by Anita (14) about her younger brother Anand (13), who thinks of himself as a scientist and is always building gadgets. His burglar alarm, set up after thefts in their colony, drops a bag of water and drenches their father, so his parents lock up his toolbox. Inspired by the film 'Back to the Future', he turns his room into a workshop and builds a 'time machine' of wires, levers and bulbs; his parents forbid him to test it until they return from a trip. While they are away a burglar breaks into the house; Anand lures him into his room, the machine starts up, and the burglar mysteriously vanishes, leaving only a green scarf behind. Anand is soon planning his next invention, a phone to talk to aliens. Themes: curiosity, imagination, perseverance, humour."
  },
  "paper boats": {
    title: "Paper Boats (Rabindranath Tagore)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 3 poem. Day by day a child floats paper boats down the running stream, writing his name and the name of his village on them in big black letters, hoping someone in a strange land will find them and know who he is. He loads them with shiuli flowers from his garden, hoping these blooms of the dawn will be carried safely to land in the night. At night he dreams that his boats float on under the midnight stars, with the fairies of sleep sailing in them, their baskets full of dreams. Themes: a child's imagination, longing to connect with the unknown world, innocence."
  },
  "north south east west": {
    title: "North, South, East, West (C. G. Salamander)",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 3. Told through postcards that Shaana, a girl from Rameswaram island, sends to her classmates and teachers while travelling across India with her parents. Each postcard describes a new place, its land, people and culture and her own experiences: the Thajiwas glacier in Kashmir in the north, where she sees snow and icy blue glaciers, floating past mangroves and crocodiles in the Sundarbans of West Bengal in the east, and other places in the west and south. Themes: the geographical and cultural diversity of India, travel and discovery."
  },
  "the tunnel": {
    title: "The Tunnel (Ruskin Bond)",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 4. Suraj, a boy fascinated by trains, cycles out of town to a railway tunnel in the jungle to watch the midday steam train come out of it. He walks through the dark tunnel and meets Sunder Singh, the watchman, who lives in a hut near the entrance, jokes that the tunnel is his and has been lent to the Government, and must check the tunnel and signal with his lamp that the line is clear before each train passes. A leopard lives in the jungle nearby. When Suraj goes with Sunder Singh to inspect the tunnel before the night mail, they find the leopard crouching on the tracks; they shout and make a noise, and it slips away before the night mail thunders through. Themes: curiosity and adventure, quiet courage, the forest and its creatures, friendship."
  },
  "travel": {
    title: "Travel (Edna St. Vincent Millay)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 4 poem. The railroad track is miles away, yet the speaker hears the trains' whistles all day and their sound all night, sees their cinders red against the sky, and longs to board any train, no matter where it is going, even while busy with friends. Theme: the longing to travel and see new places (wanderlust)."
  },
  "conquering the summit": {
    title: "Conquering the Summit",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 4. The true story of Arunima Sinha from Ambedkar Nagar, Uttar Pradesh, a national-level volleyball player. In April 2011 she was thrown off a moving train by robbers and lost a leg, which was replaced with a prosthetic leg. In hospital she resolved to climb Mount Everest, trained at the Nehru Institute of Mountaineering in Uttarkashi, and was guided by Bachendri Pal, the first Indian woman to climb Everest, who told her she had already conquered the Everest within her. After a 52-day climb she reached the summit on 21 May 2013, the first woman amputee to climb Everest. Themes: resilience, determination, courage."
  },
  "a homage to our brave soldiers": {
    title: "A Homage to Our Brave Soldiers",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 5. Letters between two friends, Soumya in Bengaluru and Ananda in Chandigarh. Soumya describes her school trip to the National War Memorial in New Delhi, near India Gate, opened in February 2019 to honour Indian soldiers who gave their lives in conflicts after Independence (1962, 1965, 1971, Kargil 1999 and peacekeeping missions). She describes the eternal flame and the four concentric circles: the Amar Chakra (immortality), Veerta Chakra (bravery), Tyag Chakra (sacrifice, with the names of the fallen) and Raksha Chakra (protection). Themes: patriotism, gratitude to soldiers, remembrance."
  },
  "my dear soldiers": {
    title: "My Dear Soldiers (A. P. J. Abdul Kalam)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 5 poem. A tribute by Dr A. P. J. Abdul Kalam to India's soldiers: while the citizens sleep peacefully, the soldiers keep watch over the nation in snow, scorching heat, deserts, marshes and valleys, and on the seas and in the skies, so that the people can live in peace. Themes: gratitude, patriotism, the sacrifice of soldiers."
  },
  "rani abbakka": {
    title: "Rani Abbakka",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 7",
    summary: "Unit 5. The story of Rani Abbakka, the 16th-century queen of Ullal on the coast of present-day Karnataka, who refused to pay tribute to the Portuguese and resisted them for years. She united the neighbouring local rulers against the Portuguese, built merchant ships, allied with the Zamorin of Kozhikode and traded with Arabia in defiance of the Portuguese, and fought them bravely. Themes: courage, freedom, leadership, resistance to colonial power."
  },

  // Class 6 Poorvi
  "a bottle of dew": {
    title: "A Bottle of Dew",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 1. Rama Natha, a lazy young man, dreams of getting rich with a magic potion that turns things into gold. The sage Mahipati tells him the potion needs five litres of dew collected from the leaves of banana plants he has planted and tended himself. Rama Natha and his wife Madhumati plant and care for a huge banana plantation for years, collecting dew and selling the bananas in the market. When he finally brings the dew, the sage reveals that the real magic was their hard work: the plantation has already made them rich. Themes: the value of hard work, the folly of shortcuts. There is no 'Ramaiah' and no father-in-law in this story."
  },
  "the raven and the fox": {
    title: "The Raven and the Fox (Jean de La Fontaine)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 1 poem. A raven sits on a branch with a piece of cheese in its beak. A fox, wanting the cheese, flatters the raven, praising its handsome looks and saying that if its voice matched its feathers it would be king of the birds. The vain raven opens its beak to sing and drops the cheese; the fox snatches it and mocks the raven, telling it to beware of flatterers. Moral: beware of flattery and vanity."
  },
  "rama to the rescue": {
    title: "Rama to the Rescue",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 1. A humorous folk tale. Late one night a man and his wife realise that a thief has crept into their house. Keeping calm, they begin a loud conversation about what to name the son they hope to have, deciding to call him Rama, and call out 'Rama! Rama!' as if calling the boy. Rama is also the name of the village kotwal (watchman), who hears his name, comes running and catches the thief. Themes: presence of mind, quick thinking, humour."
  },
  "the unlikely best friends": {
    title: "The Unlikely Best Friends",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 2. Gajaraj, the king's elephant, lives in the royal stable but is lonely until a thin, hungry stray dog, Buntee, wanders in; Gajaraj shares his food and the two become inseparable friends. When Buntee is taken away to live with someone else, Gajaraj grows miserable and stops eating, and Buntee is unhappy too; when the cause of the elephant's grief is found, Buntee is brought back and the two friends are joyfully reunited. Themes: friendship across differences, caring and loyalty."
  },
  "a friend s prayer": {
    title: "A Friend's Prayer (Jill Wolf)",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 2 poem. A prayer for friendship: the speaker prays to be a true friend who is kind, patient, understanding and forgiving, to stand by a friend in good times and bad, and that their friendship may always last. Themes: the qualities of a good friend, loyalty, gratitude for friendship."
  },
  "the chair": {
    title: "The Chair",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 2. Mario boasts that he has many friends, so his grandfather makes a bet with him and gives him an invisible 'magic chair': Mario must sit on it at school, and it will show him who his true friends are. When he tries to sit on it in class, most of the children laugh at him as he keeps falling, but three classmates, Guneet, Asma and Deepa, hold him up and help him. Mario learns that true friends are those who stand by us when we need them. Themes: true and false friendship, support, self-awareness."
  },
  "neem baba": {
    title: "Neem Baba",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 3. Amber, a girl resting after school under the neem tree in her courtyard, talks with the old tree, whom she calls Neem Baba. The tree tells her its long history (it began millions of years ago in the region of northern India and Myanmar and spread to many lands), its many names in different languages, and how its leaves, bark, flowers, fruit and roots are used as medicine and to keep pests away from crops. Amber remembers how her family used neem for measles and itchy eyes, and Neem Baba blesses her and encourages her to learn more about it. Themes: the value of trees and traditional knowledge, caring for nature."
  },
  "what a bird thought": {
    title: "What a Bird Thought",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 3 poem. A young bird describes how its idea of the world grew: inside its small blue shell it thought the world was made of blue; in its straw nest it thought the world was made of straw; when it fluttered out among the leaves it thought the world was made of leaves; and when it flew beyond the tree into the open, it realised it does not know what the world is made of, and neither do its neighbours. Themes: growing up, curiosity, our understanding widening with experience."
  },
  "spices that heal us": {
    title: "Spices that Heal Us",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 3. A letter from a grandmother to her grandchildren Vikram and Vaibhavi, who wrote that her home remedy had cured their cough and cold. She explains that she learnt these remedies as a child from her own grandmother, and describes how everyday kitchen spices such as turmeric and ginger are used as natural remedies for common ailments, warning them to use the remedies only after asking an elder. Themes: traditional Indian knowledge, health and wellness, the bond between generations."
  },
  "change of heart": {
    title: "Change of Heart",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 4. Prabhat loves to win and hates losing; he plays only games he is sure to win. When Surya, a new boy, joins and plays badminton very well, Prabhat is worried and, desperate to win their match, does not play fairly. Surya does not mind losing and stays cheerful; Prabhat notices that Surya enjoys every game whether he wins or loses, even ones he is bad at. Watching him, Prabhat changes his attitude and begins to enjoy playing for its own sake. Themes: sportsmanship, fair play, enjoying the game more than the win."
  },
  "the winner": {
    title: "The Winner",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 4 poem. Children play ball beside a creek through a summer evening, breathless with excitement, playing on as the sky turns from blue to black and the cold grass aches their feet. Themes: the joy and freedom of outdoor play, childhood, playing for the fun of it."
  },
  "yoga a way of life": {
    title: "Yoga — A Way of Life",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 4. An informative piece on yoga, which began in ancient India. The word comes from the Sanskrit root 'yuj', to join or unite: the union of body and mind, thought and action, and harmony between humans and nature. It describes asanas (postures) that build strength, flexibility, endurance and balance, pranayama (breathing) and meditation that calm the mind, reduce stress and improve sleep and concentration, and presents yoga as a holistic way of living, celebrated on International Day of Yoga (21 June)."
  },
  "hamara bharat incredible india": {
    title: "Hamara Bharat — Incredible India!",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 5. At a school event under the 'Ek Bharat Shreshtha Bharat' programme, students meet friends from other states and share their regions' traditional arts and crafts, such as Aipan (Uttarakhand), Dhokra metal craft (Odisha), coconut-shell craft (Kerala) and Kondapalli toys (Andhra Pradesh). The chapter celebrates India's cultural, linguistic and geographical diversity (rivers, mountains, forests and wildlife) and its unity in diversity."
  },
  "the kites": {
    title: "The Kites",
    type: "Poem",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 5 poem. A lively poem about kites flying in the wind: bright kites dance and soar high in the sky, while some get tangled in trees, torn or come tumbling down. Themes: the joy and freedom of flying kites, colour and movement, the spirit to rise high."
  },
  "ila sachani embroidering dreams with her feet": {
    title: "Ila Sachani: Embroidering Dreams with her Feet",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 5. The true story of Ila Sachani from Gujarat, who was born unable to use her hands. With the support of her family she learnt traditional Kathiawar embroidery using her feet, threading the needle and stitching with her toes, and became a skilled artist making cushions, bedcovers and other embroidered pieces; her work was exhibited and won her recognition and awards. Themes: determination, overcoming challenges, India's traditional crafts."
  },
  "national war memorial": {
    title: "National War Memorial",
    type: "Prose",
    book: "Poorvi",
    grade: "Class 6",
    summary: "Unit 5. An informative piece on the National War Memorial in New Delhi, near India Gate, dedicated to the nation on 25 February 2019 to honour Indian soldiers who laid down their lives defending the country after Independence. It is built as four concentric circles: the Amar Chakra (immortality, with the eternal flame), Veerta Chakra (bravery), Tyag Chakra (sacrifice, with the names of the fallen soldiers inscribed) and Raksha Chakra (protection). Themes: patriotism, respect and gratitude for soldiers, remembrance."
  },

  // ==========================================
  // CLASS 10 ENGLISH — FIRST FLIGHT & FOOTPRINTS
  // ==========================================
  "a letter to god": {
    title: "A Letter to God (G.L. Fuentes)",
    type: "Prose",
    book: "First Flight",
    grade: "Class 10",
    summary: "Lencho, a hardworking farmer, hopes for rain for his ripe corn; the rain turns into a hailstorm that destroys the whole crop. With deep faith he writes to God asking for 100 pesos. The postmaster, moved by his faith, collects money from the post office employees and his friends and sends 70 pesos signed 'God'. Lencho, sure God could not have made a mistake, writes again asking for the rest and calls the post office employees 'a bunch of crooks' who must have taken it. Themes: unshakeable faith, the irony of distrusting the very people who helped him, kindness."
  },
  "nelson mandela long walk to freedom": {
    title: "Nelson Mandela: Long Walk to Freedom",
    type: "Prose",
    book: "First Flight",
    grade: "Class 10",
    summary: "Excerpts from Mandela's autobiography detailing the 1994 democratic inauguration in Pretoria; reflects on true courage as triumph over fear, twin obligations, and liberation of both the oppressed and the oppressor."
  },
  "two stories about flying": {
    title: "Two Stories About Flying (Liam O'Flaherty & Frederick Forsyth)",
    type: "Prose",
    book: "First Flight",
    grade: "Class 10",
    summary: "(1) A young seagull conquers paralyzing fear of flight through acute hunger and motherly trickery; (2) An English pilot is miraculously guided through a lethal black storm by a mysterious pilot in a black aeroplane."
  },
  "from the diary of anne frank": {
    title: "From the Diary of Anne Frank",
    type: "Prose",
    book: "First Flight",
    grade: "Class 10",
    summary: "Extract from Anne Frank's diary, written in June 1942 just after her thirteenth birthday, before the family went into hiding. Anne explains why she keeps a diary, which she names 'Kitty': she feels she has no true friend to confide in. She gives a short history of her family (the move from Germany to Amsterdam). At school, her maths teacher Mr Keesing, annoyed by her talking in class, sets her extra essays: 'A Chatterbox', 'An Incorrigible Chatterbox', and finally 'Quack, Quack, Quack, Said Mistress Chatterback', a funny poem that wins him over, and after that he lets her talk. The Secret Annex and life in hiding are NOT part of this extract."
  },
  "glimpses of india": {
    title: "Glimpses of India (Baker from Goa, Coorg, Tea from Assam)",
    type: "Prose",
    book: "First Flight",
    grade: "Class 10",
    summary: "Three pieces. (1) A Baker from Goa (Lucio Rodrigues): the author recalls the Portuguese tradition of the Goan baker, the 'pader', who came with his jingling bamboo stick and basket of loaves, his long frock 'kabai', and how bread and cakes were part of every festival and occasion. (2) Coorg (Lokesh Abrol): the beauty of Coorg (Kodagu) in Karnataka, its coffee estates, rainforests and the Kodavu people, their martial tradition and hospitality, river rafting and the Brahmagiri hills. (3) Tea from Assam (Arup Kumar Datta): Rajvir travels by train with his friend Pranjol to Pranjol's home on a tea estate in Assam (Dhekiabari); Rajvir tells the legends of tea's discovery (the Chinese emperor and the leaves falling into boiling water; Bodhidharma's eyelids) and sees tea being plucked."
  },
  "mijbil the otter": {
    title: "Mijbil the Otter (Gavin Maxwell)",
    type: "Prose",
    book: "First Flight",
    grade: "Class 10",
    summary: "Maxwell recounts bringing a playful, water-loving smooth-coated otter named Mijbil from Iraq to Scotland and London, humorously depicting airline mishaps and urban curiosity."
  },
  "madam rides the bus": {
    title: "Madam Rides the Bus (Vallikkannan)",
    type: "Prose",
    book: "First Flight",
    grade: "Class 10",
    summary: "Valli, an observant 8-year-old village girl, saves pocket money to independently ride the town bus; experiences exhilarating discovery of the world alongside a sobering brush with mortality upon seeing a dead cow."
  },
  "the sermon at benares": {
    title: "The Sermon at Benares",
    type: "Prose",
    book: "First Flight",
    grade: "Class 10",
    summary: "Gautama Buddha guides the grief-stricken mother Kisa Gotami to request mustard seeds from a house where no one has died; teaches that death is universal and grief can only be overcome through acceptance."
  },
  "the proposal": {
    title: "The Proposal (Anton Chekhov)",
    type: "Prose",
    book: "First Flight",
    grade: "Class 10",
    summary: "A farcical Russian comedy where hypochondriac Ivan Lomov visits Chubukov to propose to Natalya, only for petty pride to erupt into hysterical arguments over Oxen Meadows and hunting dogs."
  },
  "dust of snow": {
    title: "Dust of Snow (Robert Frost)",
    type: "Poem",
    book: "First Flight",
    grade: "Class 10",
    summary: "A crow shivers snow from a poisonous hemlock tree onto the gloomy poet, instantly uplifting his spirits and saving a ruined day; symbolizes nature's subtle power of healing."
  },
  "fire and ice": {
    title: "Fire and Ice (Robert Frost)",
    type: "Poem",
    book: "First Flight",
    grade: "Class 10",
    summary: "Philosophical meditation on humanity's potential self-destruction, equating 'Fire' with unrestrained desire and greed, and 'Ice' with cold hatred and callous indifference."
  },
  "a tiger in the zoo": {
    title: "A Tiger in the Zoo (Leslie Norris)",
    type: "Poem",
    book: "First Flight",
    grade: "Class 10",
    summary: "Contrasts the magnificent tiger stalking proudly in lush jungle shadows with his helpless, quiet rage pacing behind concrete zoo cage bars; critiques wild animal captivity."
  },
  "how to tell wild animals": {
    title: "How to Tell Wild Animals (Carolyn Wells)",
    type: "Poem",
    book: "First Flight",
    grade: "Class 10",
    summary: "Humorous, tongue-in-cheek guide to identifying dangerous wild beasts (Asian Lion, Bengal Tiger, Leopard, Hyena, Crocodile, Chameleon) by their lethal traits."
  },
  "the ball poem": {
    title: "The Ball Poem (John Berryman)",
    type: "Poem",
    book: "First Flight",
    grade: "Class 10",
    summary: "A young boy loses his beloved rubber ball into the harbor; explores the epistemology of loss, initial childhood grief, and learning emotional resilience in a world of possessions."
  },
  "amanda": {
    title: "Amanda! (Robin Klein)",
    type: "Poem",
    book: "First Flight",
    grade: "Class 10",
    summary: "Depicts an adolescent girl escaping her mother's persistent nagging by retreating into vivid daydreams as a languid mermaid, a free orphan in the streets, and golden Rapunzel in a tranquil tower."
  },
  "the trees": {
    title: "The Trees (Adrienne Rich)",
    type: "Poem",
    book: "First Flight",
    grade: "Class 10",
    summary: "Decorative indoor trees break glass and dislodge roots to return to the empty forest; serves as an extended feminist metaphor for women breaking free from domestic confinement into public society."
  },
  "fog": {
    title: "Fog (Carl Sandburg)",
    type: "Poem",
    book: "First Flight",
    grade: "Class 10",
    summary: "A short imagist poem comparing silent harbor fog to a cat walking stealthily on little feet, looking quietly over town, and then silently moving away."
  },
  "the tale of custard the dragon": {
    title: "The Tale of Custard the Dragon (Ogden Nash)",
    type: "Poem",
    book: "First Flight",
    grade: "Class 10",
    summary: "Whimsical ballad about Belinda and her boastful pets (Ink, Blink, Mustard) who mock cowardly Custard; when a fierce pirate attacks, Custard devours him, proving true courage lies in actions, not words."
  },
  "for anne gregory": {
    title: "For Anne Gregory (W.B. Yeats)",
    type: "Poem",
    book: "First Flight",
    grade: "Class 10",
    summary: "Dialogue addressing romantic illusion, showing that while young men love Anne for her dazzling yellow hair, only God can love a human soul unconditionally for inner spiritual worth."
  },
  "a triumph of surgery": {
    title: "A Triumph of Surgery (James Herriot)",
    type: "Prose",
    book: "Footprints Without Feet",
    grade: "Class 10",
    summary: "Tricki, Mrs Pumphrey's pampered Pekingese, falls ill because she overfeeds him with cream cakes, chocolates and malt, and he gets no exercise. The vet James Herriot takes him to his surgery for two weeks, where he gets no food at first, only water, and then plays and runs with the other dogs. Mrs Pumphrey sends eggs, wine and brandy 'to build him up', which the vets enjoy themselves. Tricki returns healthy and lively, and Mrs Pumphrey calls it a triumph of surgery, though no surgery was done. Themes: humour, the harm of over-indulgence, sensible care of pets."
  },
  "the thief s story": {
    title: "The Thief's Story (Ruskin Bond)",
    type: "Prose",
    book: "Footprints Without Feet",
    grade: "Class 10",
    summary: "Narrated by a fifteen-year-old thief who calls himself Hari Singh. He wins the trust of Anil, a kind young writer, who lets him cook for him and starts teaching him to read, write and add. One night he steals Anil's money (six hundred rupees) and goes to the railway station to escape to Lucknow, but cannot board the train, realising that learning from Anil could make him a big man one day. He returns in the rain and puts the money back; next morning Anil, who has clearly noticed the wet notes, says nothing about it, gives him a fifty-rupee note and promises to go on teaching him. Themes: trust and kindness reforming a person, the value of education."
  },
  "the midnight visitor": {
    title: "The Midnight Visitor (Robert Arthur)",
    type: "Prose",
    book: "Footprints Without Feet",
    grade: "Class 10",
    summary: "Fowler, a young writer, follows Ausable, a fat, unimpressive secret agent, to his hotel room in Paris, disappointed that he looks nothing like a romantic spy. In the room they find Max, a rival agent, waiting with a pistol for an important paper about missiles. Ausable calmly invents a story that Max must have come in by the balcony below the window, and when a knock comes, he says it must be the police whom he had asked to check on him. Max, frightened, climbs out of the window to hide on the 'balcony' and falls with a yell, for there is no balcony; the knock was only Henry the waiter bringing drinks. Themes: presence of mind and quick wit over force."
  },
  "a question of trust": {
    title: "A Question of Trust (Victor Canning)",
    type: "Prose",
    book: "Footprints Without Feet",
    grade: "Class 10",
    summary: "Gentleman burglar Horace Danby is outsmarted at Shotover Grange by a charming young woman pretending to be the house mistress; shows there is no honor among thieves."
  },
  "footprints without feet": {
    title: "Footprints Without Feet (H.G. Wells)",
    type: "Prose",
    book: "Footprints Without Feet",
    grade: "Class 10",
    summary: "Brilliant but eccentric scientist Griffin swallows rare drugs to become invisible, but uses his genius lawlessly to burglarize, assault villagers in Iping, and escape police capture."
  },
  "the making of a scientist": {
    title: "The Making of a Scientist (Robert W. Peterson)",
    type: "Prose",
    book: "Footprints Without Feet",
    grade: "Class 10",
    summary: "Richard Ebright, who as a boy collected butterflies (the monarchs) in Reading, Pennsylvania, after his mother encouraged his curiosity and a book 'The Travels of Monarch X' led him to tag butterflies for Dr Frederick Urquhart's migration study. Science-fair projects grew into real research: he showed why viceroy butterflies copy monarchs, and discovered that the gold spots on the monarch pupa produce a hormone needed for the butterfly's development. As a student he went on to propose how a cell reads the blueprint in its DNA. Themes: curiosity, a mother's encouragement, hard work, the wish to win, and how a scientist is made."
  },
  "the necklace": {
    title: "The Necklace (Guy de Maupassant)",
    type: "Prose",
    book: "Footprints Without Feet",
    grade: "Class 10",
    summary: "Matilda Loisel, a pretty but discontented woman married to a clerk, borrows a diamond necklace from her rich friend Mme Forestier to wear at a ball at the Ministry, and loses it. She and her husband buy a replacement for 36,000 francs, borrowing heavily, and spend ten years in hard work and poverty to repay the debt. Later she meets Mme Forestier and learns the original necklace was an imitation worth at most 500 francs. Themes: vanity and pride, honesty, the cost of appearances, irony. (NCERT spells her name Matilda.)"
  },
  "bholi": {
    title: "Bholi (K.A. Abbas)",
    type: "Prose",
    book: "Footprints Without Feet",
    grade: "Class 10",
    summary: "Neglected, stammering girl Sulekha ('Bholi') is empowered by her dedicated village schoolteacher; at her wedding, she courageously refuses to marry greedy dowry-seeker Bishamber."
  },
  "the book that saved the earth": {
    title: "The Book That Saved the Earth (Claire Boiko)",
    type: "Prose",
    book: "Footprints Without Feet",
    grade: "Class 10",
    summary: "A humorous play: a historian of the 25th century tells how Earth was saved in the twenty-first century. Think-Tank, the vain, big-headed ruler of Mars, plans to invade Earth and orders his crew (Captain Omega, Lieutenant Iota, Sergeant Oop) to study an Earth 'sandwich-book' they find in a library: Mother Goose nursery rhymes. With his assistant Noodle he misreads the rhymes ('Humpty Dumpty', 'Mary Had a Little Lamb', 'Hey Diddle Diddle') as secret codes about Earth's power, panics, calls off the invasion and orders the Martians to flee. Themes: humour, the folly of arrogance, the power of books."
  },

  // ==========================================
  // CLASS 11 ENGLISH CORE — HORNBILL & SNAPSHOTS
  // ==========================================
  // Classes 11 and 12 had no entries, so the AI set every literature question
  // from memory. These books are long established and it mostly gets them
  // right, but the Class 7 paper showed what happens when it guesses; every
  // entry below is checked against the book.
  "the portrait of a lady": {
    title: "The Portrait of a Lady (Khushwant Singh)",
    type: "Prose",
    book: "Hornbill",
    grade: "Class 11",
    summary: "The author remembers his grandmother: very old, short, fat and slightly bent, always telling the beads of her rosary. In the village she got him ready for school, went with him to the temple school, and fed the village dogs with stale chapattis on the way. When they moved to the city and he went to an English school, she could no longer help him; she disliked his learning about Western science and music, which she thought was not for gentlefolk, and spent her time feeding the sparrows in the courtyard. When he went abroad for five years she saw him off at the station silently and kissed his forehead. On his return she celebrated by gathering the women of the neighbourhood and singing to an old drum all evening; the next morning she fell ill, refused to stop praying, and died peacefully telling her beads. Thousands of sparrows came and sat silently around her body, ignored the crumbs the author's mother threw them, and flew away after her body was carried off. Themes: love and dignity of the old, the gap between generations, faith."
  },
  "we re not afraid to die if we can all be together": {
    title: "We're Not Afraid to Die... If We Can All Be Together (Gordon Cook and Alan East)",
    type: "Prose",
    book: "Hornbill",
    grade: "Class 11",
    summary: "The narrator, his wife Mary, son Jonathan (6) and daughter Suzanne (7) set out from Plymouth in July 1976 to sail round the world in their boat Wavewalker, with two crewmen, Larry Vigil and Herb Seigler. In the southern Indian Ocean a gigantic wave strikes the boat and nearly sinks it: the narrator is thrown overboard and climbs back, the boat fills with water, he hurts his ribs and Suzanne is badly hurt on the head but does not complain. They pump water for hours and patch the hull. Jonathan tells his father that they are not afraid of dying if they can all be together. After days of danger the narrator navigates them to the tiny Ile Amsterdam, where they are rescued. Themes: courage, optimism and teamwork in a crisis, family love."
  },
  "discovering tut the saga continues": {
    title: "Discovering Tut: The Saga Continues (A.R. Williams)",
    type: "Prose",
    book: "Hornbill",
    grade: "Class 11",
    summary: "Tutankhamun, the boy king of Egypt who died at about nineteen over 3,300 years ago, was the last of his family's line. Howard Carter found his tomb in 1922; because the resins had hardened, Carter's team cut the mummy apart to remove it and the treasures from the coffin. In 2005, under Zahi Hawass, the mummy was scanned with a CT scanner to learn how he lived and died. The essay recalls Amenhotep III (probably his grandfather) and Akhenaten (perhaps his father), who replaced the old gods with the worship of the Aten, and how in Tut's reign the old gods were restored. Themes: archaeology, science helping us understand history, the mystery of the past."
  },
  "the adventure": {
    title: "The Adventure (Jayant Narlikar)",
    type: "Prose",
    book: "Hornbill",
    grade: "Class 11",
    summary: "Professor Gaitonde, a historian, is in a collision with a truck and finds himself in another version of India, in which the Marathas won the third Battle of Panipat (1761) because Vishwasrao escaped the bullet that killed him in real history; the British never ruled India and the East India Company remained a trading company confined to Bombay. In a library he reads this alternative history. At a meeting at Azad Maidan he sits in the empty chair of the chairman and is thrown out, and then wakes in hospital in his own world. Rajendra Deshpande, a scientist, explains his experience through catastrophe theory and the lack of determinism in quantum theory: the professor may have passed into an alternative reality. Themes: history and chance, science and alternative worlds."
  },
  "silk road": {
    title: "Silk Road (Nick Middleton)",
    type: "Prose",
    book: "Hornbill",
    grade: "Class 11",
    summary: "A travelogue of the author's journey from Lhasa across western Tibet to Mount Kailash for the kora, the holy circuit around the mountain. He travels with his driver Tsetan and guide Daniel, meets nomads with their herds and fierce mastiffs, crosses high passes, finds Hor a grim, dirty town, and in Darchen suffers from the cold and altitude sickness; a doctor treats him. In Darchen he meets Norbu, a Tibetan academic also going on the kora, and finally sets out round the mountain. Themes: the hardship and beauty of travel, Tibetan landscape and faith."
  },
  "a photograph": {
    title: "A Photograph (Shirley Toulson)",
    type: "Poem",
    book: "Hornbill",
    grade: "Class 11",
    summary: "The poet looks at an old photograph of her mother at about twelve, paddling at the sea with two girl cousins, holding her hands. Twenty or thirty years later her mother would laugh at the picture and at their old-fashioned clothes. Now the mother has been dead for nearly as many years as the girl in the photograph was old, and the poet has nothing to say about that circumstance: 'Its silence silences.' Themes: the passage of time, loss and memory; the sea stays the same while human life changes."
  },
  "the laburnum top": {
    title: "The Laburnum Top (Ted Hughes)",
    type: "Poem",
    book: "Hornbill",
    grade: "Class 11",
    summary: "On a September afternoon the top of a laburnum tree is silent and still, its leaves yellow. A goldfinch arrives with a twitching chirrup, 'a suddenness, a startlement, at a branch end', and the tree comes alive: she enters the leaves to feed her young in the nest, and the whole tree trembles and thrills with their chitterings. She stokes her family full, flits out to a branch end, then launches away towards the infinite, and the laburnum subsides to empty silence. Themes: nature, the life a bird brings to a tree, a mother's care for her young."
  },
  "the voice of the rain": {
    title: "The Voice of the Rain (Walt Whitman)",
    type: "Poem",
    book: "Hornbill",
    grade: "Class 11",
    summary: "The poet asks the falling rain who it is; the rain answers that it is the Poem of Earth, rising from the land and the sea into the sky, then coming down to wash and give life to the earth, and returning to its origin. The poet adds in brackets that a song, issuing from its birthplace, after fulfilment, also returns with love to its origin. Themes: the water cycle as a cycle of life, the likeness between rain and poetry."
  },
  "childhood": {
    title: "Childhood (Markus Natten)",
    type: "Poem",
    book: "Hornbill",
    grade: "Class 11",
    summary: "The poet asks when his childhood went. Was it when he stopped being eleven, when he found that hell and heaven could not be found in geography; when he saw that adults were not what they seemed, preaching love but not acting lovingly; or when he found that his mind was his own, to use as he chose? He concludes that his childhood has gone to some forgotten place, hidden in an infant's face. Themes: the loss of innocence, growing up, reason and individuality."
  },
  "father to son": {
    title: "Father to Son (Elizabeth Jennings)",
    type: "Poem",
    book: "Hornbill",
    grade: "Class 11",
    summary: "A father laments that he does not understand his grown son, though they have lived in the same house for years; the son seems a stranger with a world of his own. The father wants to build on the land he knows, to see his son grow up in it, but the son is drawn elsewhere. Both are hurt and angry; at the end father and son each put out an empty hand, longing for something to forgive. Themes: the generation gap, failure of communication between parent and child, love and longing for understanding."
  },
  "the summer of the beautiful white horse": {
    title: "The Summer of the Beautiful White Horse (William Saroyan)",
    type: "Prose",
    book: "Snapshots",
    grade: "Class 11",
    summary: "Aram, nine, narrates. His cousin Mourad, thought 'crazy', wakes him at four in the morning sitting on a beautiful white horse. Their Garoghlanian tribe is poor but famous for its honesty, so Aram cannot believe Mourad has stolen it, yet the boys ride it secretly and hide it in a barn on a deserted vineyard. Mourad has a way with animals: he mends a robin's broken wing and calms dogs. Uncle Khosrove, an angry man whose catchphrase is 'It is no harm; pay no attention to it', also appears. John Byro, an Assyrian farmer, complains that his white horse was stolen; when he meets the boys with the horse he looks at its teeth but says he would swear it is his horse, yet 'a suspicious man would believe his eyes instead of his heart', and lets them go. The boys return the horse to his barn, and Byro later says it is better tempered than before. Themes: honesty, family pride, childhood longing, innocence."
  },
  "the address": {
    title: "The Address (Marga Minco)",
    type: "Prose",
    book: "Snapshots",
    grade: "Class 11",
    summary: "Set in Holland after the Second World War. During the war Mrs Dorling, an acquaintance of the narrator's Jewish mother, took away the family's valuable possessions for 'safe keeping'. After the war, the mother dead, the daughter goes to Mrs Dorling's house at 46 Marconi Street; Mrs Dorling pretends not to know her and shuts the door. On a second visit Mrs Dorling's daughter lets her in, and she sees her mother's things (the tablecloth with a burn mark, the silver cutlery, the antique pewter plate) in ugly, alien surroundings, and feels they have lost their meaning. She leaves, deciding to forget the address. Themes: war and loss, memory, attachment to possessions, letting go."
  },
  "mother s day": {
    title: "Mother's Day (J.B. Priestley)",
    type: "Prose",
    book: "Snapshots",
    grade: "Class 11",
    summary: "A comic one-act play. Mrs Annie Pearson is treated like a servant by her husband George and grown children Doris and Cyril. Her bold neighbour Mrs Fitzgerald, who can tell fortunes, exchanges personalities with her by a magic spell. As Mrs Pearson (now in Mrs Fitzgerald's body) shocks the family by smoking, drinking stout, refusing to work and speaking sharply, they learn to respect her. The personalities are switched back, and Mrs Pearson, now firm, arranges a family game of rummy while she talks with her husband. Themes: a mother's unrecognised work, the need for respect and family responsibility, humour."
  },
  "birth": {
    title: "Birth (A.J. Cronin)",
    type: "Prose",
    book: "Snapshots",
    grade: "Class 11",
    summary: "From 'The Citadel'. Andrew Manson, a young doctor just out of medical college, is called at midnight to deliver the first baby of Susan Morgan, wife of the miner Joe Morgan, in a Welsh mining town. After a long night's work he saves the mother, but the baby is born apparently lifeless. Remembering a case he once saw, he revives it by plunging it alternately into hot and cold water and rubbing it, until it cries. As he walks home he feels he has at last done something real. Themes: a doctor's dedication, life and death, the miracle of birth."
  },
  "the tale of melon city": {
    title: "The Tale of Melon City (Vikram Seth)",
    type: "Poem",
    book: "Snapshots",
    grade: "Class 11",
    summary: "A humorous narrative poem. A just and placid king orders an arch to be built across a main street; it is built too low and knocks off his crown. He orders the chief of builders hanged, and the blame passes from the builders to the workmen, the masons and the architect, and finally back to the king. A wise old man is consulted; the noose is too high for anyone but the king, so the king himself is hanged. The ministers proclaim that the next man to pass the city gate will choose the new king; an idiot says 'a melon', so a melon is crowned, and the people are content as long as they are left in peace. Themes: satire on foolish rulers and justice, people's indifference to who rules them."
  },

  // ==========================================
  // CLASS 12 ENGLISH CORE — FLAMINGO & VISTAS
  // ==========================================
  "the last lesson": {
    title: "The Last Lesson (Alphonse Daudet)",
    type: "Prose",
    book: "Flamingo",
    grade: "Class 12",
    summary: "Set in Alsace in 1870, after the Prussians won the Franco-Prussian War. Little Franz is late for school and afraid of being scolded for not learning his participles, but finds the class strangely quiet, M. Hamel in his best clothes, and village elders such as old Hauser sitting at the back. M. Hamel announces that an order has come from Berlin that only German will be taught in the schools of Alsace and Lorraine; this is their last French lesson. Franz regrets having wasted his time. M. Hamel tells them French is the most beautiful language and to hold on to it, for while a people keep their language they hold the key to their prison. At the end he writes 'Vive La France!' on the board and dismisses them. Themes: love of one's language, the pain of linguistic chauvinism, valuing what we have before it is lost."
  },
  "lost spring": {
    title: "Lost Spring (Anees Jung)",
    type: "Prose",
    book: "Flamingo",
    grade: "Class 12",
    summary: "Two stories of children robbed of childhood by poverty. Saheb-e-Alam, whose family came from Dhaka, is a ragpicker in Seemapuri on the edge of Delhi, scrounging in garbage for 'gold'; he later works at a tea stall for 800 rupees a month and loses his freedom. Mukesh lives in Firozabad, where families have made glass bangles for generations, working in dark hot furnaces and losing their eyesight; caught in a vicious circle of sahukars, middlemen, policemen and politicians, they accept their fate, but Mukesh dreams of becoming a motor mechanic. Themes: child labour, poverty, exploitation, lost childhood."
  },
  "deep water": {
    title: "Deep Water (William Douglas)",
    type: "Prose",
    book: "Flamingo",
    grade: "Class 12",
    summary: "William O. Douglas describes his fear of water: as a child of three or four a wave knocked him down at a California beach. At about ten or eleven, learning to swim at the Y.M.C.A. pool, a big bruiser of a boy threw him into the deep end; he nearly drowned, and the terror haunted him for years. He hired an instructor who taught him piece by piece, with a rope and pulley, and then tested himself alone, swimming in Lake Wentworth in New Hampshire and at Warm Lake, until he had conquered the fear. He concludes that in death there is peace and that there is terror only in the fear of death, as Roosevelt said: 'All we have to fear is fear itself.' Themes: overcoming fear through will and effort."
  },
  "the rattrap": {
    title: "The Rattrap (Selma Lagerlöf)",
    type: "Prose",
    book: "Flamingo",
    grade: "Class 12",
    summary: "A poor peddler who sells rattraps believes the whole world is a big rattrap that tempts people with bait. A lonely old crofter gives him shelter and shows him the thirty kronor he earned from his cow; next day the peddler steals it, gets lost in the forest and realises he himself is caught in a trap. At the Ramsjö ironworks the ironmaster mistakes him for an old regimental comrade, Captain von Stahle, and invites him home for Christmas; when the mistake is found out, the ironmaster wants him gone, but the daughter, Edla Willmansson, insists he stay and treats him kindly. He leaves the stolen money and a rattrap as a Christmas present, with a letter signed Captain von Stahle, asking her to return the money to the crofter. Themes: human kindness can redeem a person, the trap of material greed."
  },
  "indigo": {
    title: "Indigo (Louis Fischer)",
    type: "Prose",
    book: "Flamingo",
    grade: "Class 12",
    summary: "From 'The Life of Mahatma Gandhi'. In 1916 Rajkumar Shukla, an illiterate sharecropper from Champaran in Bihar, persuades Gandhi to come and see the peasants' plight: British landlords forced them to grow indigo on 15 per cent of their land (the tinkathia system) and, when synthetic indigo made it worthless, demanded compensation. In Motihari Gandhi was ordered to leave the district; he refused, peasants gathered in thousands, and the case against him was dropped (the first civil disobedience in India). An official inquiry followed; Gandhi accepted a 25 per cent refund from the planters, because the principle of their surrender mattered more than the money. He also worked on schools, hygiene and health in the villages. Themes: freedom from fear, self-reliance, non-violent resistance."
  },
  "poets and pancakes": {
    title: "Poets and Pancakes (Asokamitran)",
    type: "Prose",
    book: "Flamingo",
    grade: "Class 12",
    summary: "An extract from 'My Years with Boss', a humorous account of the author's years at Gemini Studios in Madras in the 1940s. Pancake was the brand of make-up the studio bought in truckloads; the make-up department was run by a Bengali and then a Maharashtrian, with an office boy who wanted to be a writer and blamed Kothamangalam Subbu for his failure. Subbu, the Boss's loyal number two, was creative but treated as a sycophant. The 'poets' were the staff of the story department. The author recalls the visit of the Moral Rearmament Army, and that of an English poet whom no one understood; years later the author discovered he was Stephen Spender, editor of 'The Encounter' and a contributor to 'The God That Failed'. Themes: gentle satire, the film world, humour."
  },
  "the interview": {
    title: "The Interview (Christopher Silvester)",
    type: "Prose",
    book: "Flamingo",
    grade: "Class 12",
    summary: "Part I discusses the interview as a form of journalism, invented about 130 years ago: some see it as an art and a source of truth, while celebrities such as V.S. Naipaul, Lewis Carroll, Rudyard Kipling and H.G. Wells disliked or distrusted it. Part II is an extract from Mukund Padmanabhan's interview with the Italian scholar and novelist Umberto Eco, who explains how he finds time to do so much by using the 'interstices', the empty spaces in his day, and how his novel 'The Name of the Rose' became a huge success though it was a serious work. Themes: the value and limits of the interview, the life of a writer."
  },
  "going places": {
    title: "Going Places (A.R. Barton)",
    type: "Prose",
    book: "Flamingo",
    grade: "Class 12",
    summary: "Sophie, a girl from a poor working-class family about to leave school, dreams of owning a boutique, becoming an actress or a fashion designer, though her friend Jansie knows they are meant for the biscuit factory. She hero-worships her brother Geoff and the young Irish footballer Danny Casey, whom her father and brothers follow, and makes up a story that she met Casey and that he promised to meet her. She waits for him alone by the canal one evening, but he never comes. Themes: adolescent fantasy versus reality, dreams and disappointment."
  },
  "my mother at sixty six": {
    title: "My Mother at Sixty-Six (Kamala Das)",
    type: "Poem",
    book: "Flamingo",
    grade: "Class 12",
    summary: "Driving from her parents' home to Cochin airport, the poet looks at her mother dozing beside her, her face ashen like a corpse, and feels her old familiar ache, the childhood fear of losing her. She turns away to look at the young trees sprinting past and the merry children spilling out of their homes. At the security check she looks again at her mother, wan and pale as a late winter's moon, but hides her fear and says only, 'See you soon, Amma', smiling. Themes: ageing, the fear of losing a parent, love between mother and daughter."
  },
  "keeping quiet": {
    title: "Keeping Quiet (Pablo Neruda)",
    type: "Poem",
    book: "Flamingo",
    grade: "Class 12",
    summary: "The poet asks us to count to twelve and keep still for once on the face of the earth, without speaking any language or moving our arms. In that moment there would be no rush or engines; fishermen would not harm the whales, the man gathering salt would look at his hurt hands, and those preparing wars would put on clean clothes and walk with their brothers. He does not mean total inactivity or death; perhaps a huge silence could interrupt the sadness of never understanding ourselves, as the earth teaches us when everything seems dead and later proves to be alive. Themes: introspection, peace, unity, the value of silence."
  },
  "a thing of beauty": {
    title: "A Thing of Beauty (John Keats)",
    type: "Poem",
    book: "Flamingo",
    grade: "Class 12",
    summary: "An extract from 'Endymion'. A thing of beauty is a joy for ever: its loveliness increases, it never passes into nothingness, and it gives us a quiet bower, sleep full of sweet dreams, health and quiet breathing. In spite of despondence, gloomy days and our own unhealthy ways, beauty removes the pall from our dark spirits: the sun, the moon, trees, daffodils, clear rills, the musk-rose blooms, and the grandeur of the mighty dead and the stories we have heard. All these are an endless fountain of immortal drink pouring from heaven. Themes: beauty as a source of lasting joy and strength."
  },
  "a roadside stand": {
    title: "A Roadside Stand (Robert Frost)",
    type: "Poem",
    book: "Flamingo",
    grade: "Class 12",
    summary: "A poor rural family puts up a little shed by the road to sell wild berries and squash to the city traffic, hoping for some city money; but the cars rush past without a look, or stop only to ask the way or complain about the scenery. The poet is pained by the country people's unfulfilled hopes and by the city planners and 'greedy good-doers' who promise to help them, and he sometimes wishes to end their pain at one stroke. Themes: the gap between the rich city and the poor countryside, insensitivity, empathy."
  },
  "aunt jennifer s tigers": {
    title: "Aunt Jennifer's Tigers (Adrienne Rich)",
    type: "Poem",
    book: "Flamingo",
    grade: "Class 12",
    summary: "Aunt Jennifer embroiders tigers on a screen: bright topaz tigers prancing proudly and fearlessly through a green world, unafraid of the men beneath the tree. Her own fingers flutter through the wool, finding even the needle hard to pull, because the massive weight of Uncle's wedding band sits heavily on her hand. When she is dead her terrified hands will still lie ringed with the ordeals she was mastered by, but the tigers she made will go on prancing, proud and unafraid. Themes: a woman's oppression in marriage, art as escape and as freedom."
  },
  "the third level": {
    title: "The Third Level (Jack Finney)",
    type: "Prose",
    book: "Vistas",
    grade: "Class 12",
    summary: "Charley, thirty-one, says that one night he found a third level beneath the two levels of Grand Central Station in New York: gas lamps, people in old-fashioned clothes and a newspaper dated 1894. He tried to buy two tickets to Galesburg, Illinois, a peaceful town of his childhood, but his money was the modern kind and the clerk took him for a fraud. He changed his money for old currency at a loss, but never found the third level again. His psychiatrist friend Sam says it is a waking dream, a way to escape the worries of modern life; Sam then disappears, and Charley later finds in his grandfather's stamp collection a first-day cover posted in 1894 to his grandfather, in which Sam writes that he has reached Galesburg. Themes: escapism, the stress of modern life, the mystery of time."
  },
  "the tiger king": {
    title: "The Tiger King (Kalki)",
    type: "Prose",
    book: "Vistas",
    grade: "Class 12",
    summary: "A satire. At his birth the astrologers predict that the Maharaja of Pratibandapuram, Jilani Jung Jung Bahadur, will be killed by a tiger, specifically the hundredth tiger. He sets out to kill a hundred tigers, bans tiger hunting by anyone else, saves his throne from an angry British officer by sending the officer's wife costly diamond rings, and even marries a princess from a state with many tigers. When the tigers run out at ninety-nine, his dewan secretly brings an old tiger from the People's Park in Madras; the king shoots it but only frightens it unconscious, and the hunters kill it secretly. Later he buys a wooden toy tiger for his son's birthday; a sliver from it pricks his hand, the wound becomes infected, and he dies during the operation, killed by the hundredth tiger. Themes: satire on the vanity of rulers, the cruelty of hunting, irony of fate."
  },
  "journey to the end of the earth": {
    title: "Journey to the End of the Earth (Tishani Doshi)",
    type: "Prose",
    book: "Vistas",
    grade: "Class 12",
    summary: "The author's journey to Antarctica aboard the Russian research vessel Akademik Shokalskiy with the 'Students on Ice' programme, led by Geoffrey Green, which takes high-school students to the end of the world so that they will understand and act on climate change. She describes Antarctica's place in the history of Gondwana, its ice and silence, and how changes there show the effects of global warming; tiny phytoplankton sustain the whole food chain, so small changes can have huge effects. Themes: climate change, the fragile environment, the need for young people to act."
  },
  "the enemy": {
    title: "The Enemy (Pearl S. Buck)",
    type: "Prose",
    book: "Vistas",
    grade: "Class 12",
    summary: "During the Second World War, Dr Sadao Hoki, a Japanese surgeon trained in America, and his wife Hana find a wounded American prisoner of war washed up on the beach near their house. Though he is the enemy, Sadao's duty as a doctor makes him operate and save the man; their servants leave in protest. Sadao tells the old General, whom he is treating, and the General promises to send assassins, but forgets. In the end Sadao helps the American escape in his boat to a nearby island to wait for a Korean fishing boat. Themes: humanity and professional duty above national hatred, the conflict between patriotism and compassion."
  },
  "on the face of it": {
    title: "On the Face of It (Susan Hill)",
    type: "Prose",
    book: "Vistas",
    grade: "Class 12",
    summary: "A play. Derry, a fourteen-year-old boy whose face was burnt on one side by acid, avoids people because they stare or pity him. He climbs into the garden of Mr Lamb, an old man with a tin leg who welcomes everyone and is not bitter. Mr Lamb talks about bees, weeds and flowers and helps Derry see that what matters is inside a person and how he looks at the world. Derry promises to come back and help him pick crab apples, despite his mother's objections; when he returns, he finds Mr Lamb has fallen from his ladder and died. Themes: disability, loneliness and isolation, acceptance and the power of a positive outlook."
  },
  "memories of childhood": {
    title: "Memories of Childhood (Zitkala-Sa and Bama)",
    type: "Prose",
    book: "Vistas",
    grade: "Class 12",
    summary: "Two autobiographical accounts by women from marginalised communities. (1) 'The Cutting of My Long Hair' by Zitkala-Sa, a Native American: at a missionary boarding school (the 'land of apples') she is humiliated by the rules, the tight clothes and above all the cutting of her long hair, which among her people was done only to cowards; she hides under a bed and is dragged out, and feels she has lost her spirit. (2) 'We Too Are Human Beings' by Bama, a Tamil Dalit writer (from 'Karukku'): as a child she laughs at an elder of her community carrying a packet of snacks by its string so as not to touch it, until her elder brother Annan explains untouchability, and tells her that education is the way to earn respect; she studies hard and stands first. Themes: discrimination, cultural oppression, resistance, the value of education."
  },

  // ==========================================
  // CLASS 9 ENGLISH — BEEHIVE & MOMENTS (LEGACY)
  // ==========================================
  "the fun they had": {
    title: "The Fun They Had (Isaac Asimov)",
    type: "Prose",
    book: "Beehive",
    grade: "Class 9",
    summary: "In 2157, Margie and Tommy discover an old printed book about 20th-century human teachers and shared classrooms; contrasts cold, isolated digital home screens with the joy of learning together."
  },
  "the sound of music": {
    title: "The Sound of Music (Deborah Cowley)",
    type: "Prose",
    book: "Beehive",
    grade: "Class 9",
    summary: "Evelyn Glennie overcomes severe deafness to become a world-renowned multi-percussionist feeling music through her body; Ustad Bismillah Khan elevates the shehnai to classical prominence."
  },
  "the little girl": {
    title: "The Little Girl (Katherine Mansfield)",
    type: "Prose",
    book: "Beehive",
    grade: "Class 9",
    summary: "Kezia fears her strict, distant father; after a frightening nightmare when left alone, she discovers his deep, protective affection and understanding heart."
  },
  "a truly beautiful mind": {
    title: "A Truly Beautiful Mind",
    type: "Prose",
    book: "Beehive",
    grade: "Class 9",
    summary: "Biographical portrait of Albert Einstein, balancing his revolutionary physics discoveries (Theory of Relativity) with his steadfast crusade for world peace, nuclear disarmament, and democracy."
  },
  "the snake and the mirror": {
    title: "The Snake and the Mirror (V.M. Basheer)",
    type: "Prose",
    book: "Beehive",
    grade: "Class 9",
    summary: "A vain homeopathic doctor freezes when a venomous cobra lands on his shoulder; humorous relief ensues when the snake is captivated by its own reflection in a mirror, sparing his life."
  },
  "my childhood": {
    title: "My Childhood (A.P.J. Abdul Kalam)",
    type: "Prose",
    book: "Beehive",
    grade: "Class 9",
    summary: "Kalam recalls his boyhood in Rameswaram, depicting communal harmony, supportive parents, transformative mentors like Sivasubramania Iyer, and triumph over religious bigotry."
  },
  "reach for the top": {
    title: "Reach for the Top",
    type: "Prose",
    book: "Beehive",
    grade: "Class 9",
    summary: "Santosh Yadav defies rural social orthodoxies to scale Mount Everest twice with humanitarian courage; Maria Sharapova endures sacrifice and loneliness to attain tennis world No. 1."
  },
  "kathmandu": {
    title: "Kathmandu (Vikram Seth)",
    type: "Prose",
    book: "Beehive",
    grade: "Class 9",
    summary: "Travelogue contrasting the bustling holy chaos of Pashupatinath temple with the quiet Buddhist peace of Baudhnath stupa, enchanted by a flute seller's meditative tunes."
  },
  "if i were you": {
    title: "If I Were You (Douglas James)",
    type: "Prose",
    book: "Beehive",
    grade: "Class 9",
    summary: "Playwright Gerrard keeps his cool when an escaped jewel thief threatens to kill and impersonate him; outwits the intruder by locking him in a cupboard."
  },
  "the road not taken": {
    title: "The Road Not Taken (Robert Frost)",
    type: "Poem",
    book: "Beehive",
    grade: "Class 9",
    summary: "A traveler in an autumn wood stands between two diverging paths, choosing the less frequented one; contemplates how fateful choices shape life's unique journey."
  },
  "wind": {
    title: "Wind (Subramania Bharati)",
    type: "Poem",
    book: "Beehive",
    grade: "Class 9",
    summary: "The wind shatters weak structures but fuels raging fires; urges humans to build steadfast homes, sturdy bodies, and strong hearts to turn adversity into strength."
  },
  "rain on the roof": {
    title: "Rain on the Roof (Coates Kinney)",
    type: "Poem",
    book: "Beehive",
    grade: "Class 9",
    summary: "The gentle pitter-patter of raindrops on the shingles brings soothing solace, evoking tender childhood memories of the poet's affectionate mother tucking her children into bed."
  },
  "the lake isle of innisfree": {
    title: "The Lake Isle of Innisfree (W.B. Yeats)",
    type: "Poem",
    book: "Beehive",
    grade: "Class 9",
    summary: "Yeats longs to escape gray city pavements for the tranquil solitude of Innisfree, dreaming of a small wattled cabin, bean rows, and honeybees."
  },
  "a legend of the northland": {
    title: "A Legend of the Northland (Phoebe Cary)",
    type: "Poem",
    book: "Beehive",
    grade: "Class 9",
    summary: "Ballad where Saint Peter punishes a selfish woman who refuses to share a tiny cake by turning her into a woodpecker forced to bore hard wood for sparse sustenance."
  },
  "no men are foreign": {
    title: "No Men Are Foreign (James Kirkup)",
    type: "Poem",
    book: "Beehive",
    grade: "Class 9",
    summary: "Humanitarian anti-war poem reminding us that all humans walk the same earth, breathe the same air, and share common brotherhood; hating others only defiles our shared home."
  },
  "on killing a tree": {
    title: "On Killing a Tree (Gieve Patel)",
    type: "Poem",
    book: "Beehive",
    grade: "Class 9",
    summary: "A graphic, ironic critique demonstrating that chopping cannot kill a resilient tree; it only dies when its secret underground roots are violently wrenched from the earth."
  },
  "a slumber did my spirit seal": {
    title: "A Slumber Did My Spirit Seal (William Wordsworth)",
    type: "Poem",
    book: "Beehive",
    grade: "Class 9",
    summary: "A solemn elegy grieving beloved Lucy's passing, finding calm solace in her eternal communion with nature rolled round in earth's diurnal course with rocks and trees."
  },
  "the lost child": {
    title: "The Lost Child (Mulk Raj Anand)",
    type: "Prose",
    book: "Moments",
    grade: "Class 9",
    summary: "A boy at a spring fair begs for sweets, toys, and rides; when separated from his parents, he rejects every alluring offer, weeping only for his lost mother and father."
  },
  "the adventures of toto": {
    title: "The Adventures of Toto (Ruskin Bond)",
    type: "Prose",
    book: "Moments",
    grade: "Class 9",
    summary: "Grandfather buys a mischievous monkey named Toto who wreaks comical havoc, boiling in a kettle and shredding clothes before being sold back to a tonga driver."
  },
  "iswaran the storyteller": {
    title: "Iswaran the Storyteller (R.K. Laxman)",
    type: "Prose",
    book: "Moments",
    grade: "Class 9",
    summary: "Cook Iswaran entertains supervisor Mahendra with vivid dramatic tales, unnerving him with an eerie ghost story of an ancestral female apparition carrying a fetus on full moon nights."
  },
  "in the kingdom of fools": {
    title: "In the Kingdom of Fools (A.K. Ramanujan)",
    type: "Prose",
    book: "Moments",
    grade: "Class 9",
    summary: "A foolish king rules a land where day is night and everything costs one duddu; a wise guru saves his gluttonous disciple from the gallows through clever reverse psychology."
  },
  "the happy prince": {
    title: "The Happy Prince (Oscar Wilde)",
    type: "Prose",
    book: "Moments",
    grade: "Class 9",
    summary: "A gilded statue and a compassionate swallow sacrifice gold leaf, sapphires, and their lives to relieve impoverished citizens; welcomed as precious souls into God's eternal paradise."
  },
  "the last leaf": {
    title: "The Last Leaf (O. Henry)",
    type: "Prose",
    book: "Moments",
    grade: "Class 9",
    summary: "Sick artist Johnsy believes she will die when the last vine leaf drops; elderly neighbor Behrman braves a freezing storm to paint a lifelike leaf, sacrificing his life to rekindle her will to live."
  },
  "a house is not a home": {
    title: "A House Is Not a Home (Zan Gaudioso)",
    type: "Prose",
    book: "Moments",
    grade: "Class 9",
    summary: "A teen boy loses his home and cat in a tragic fire; generous community solidarity from his school and the miraculous return of his cat help him heal and rebuild his spirit."
  },
  "the beggar": {
    title: "The Beggar (Anton Chekhov)",
    type: "Prose",
    book: "Moments",
    grade: "Class 9",
    summary: "Drunken beggar Lushkoff is redeemed not by advocate Sergei's scoldings, but by the selfless cook Olga who secretly chopped wood on his behalf with compassionate tears."
  }
};

/**
 * Normalizes a chapter title string to find matches in LITERATURE_SUMMARIES.
 */
export function normalizeChapterKey(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw
    .toLowerCase()
    .replace(/^section\s+[a-z0-9]+(?:\s*:\s*|\s*-\s*)/i, '')
    .replace(/^(?:literature|textbooks?|prose|poetry|supplementary|reader|kavya|gadya|patrapustak)[^:\->]*[:\->]\s*/i, '')
    .replace(/^(?:chapter|ch|unit|poem|pad|paath|पाठ|पद)\s*\d+[\s:.-]*/i, '')
    .replace(/^\d+[\s:.-]+/, '')
    .replace(/\(.*?\)/g, '') // remove parenthetical remarks e.g. author name
    .replace(/[^a-z0-9\u0900-\u097F\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Finds a matching literature summary from LITERATURE_SUMMARIES for a given chapter string.
 * With a grade (e.g. "Class 7"), only that class's books are searched: the
 * substring match would otherwise give a Class 11 "The Adventure" the summary
 * of Class 9 "The Adventures of Toto", or a Class 7 poem the plot of a Class 6 one.
 */
export function findLiteratureSummary(chapterStr, grade) {
  if (!chapterStr) return null;
  const normInput = normalizeChapterKey(chapterStr);
  if (!normInput || normInput.length < 3) return null;

  const entries = Object.entries(LITERATURE_SUMMARIES).filter(([, item]) => !grade || item.grade === grade);

  // 1. Exact match first, so the poem "Words" is not taken for "Carrier of Words"
  const exact = entries.find(([key]) => key === normInput);
  if (exact) return exact[1];

  // 2. Substring match in DB keys
  for (const [key, item] of entries) {
    if (normInput.includes(key) || key.includes(normInput)) {
      return item;
    }
  }

  // 3. Specific key tokens match
  for (const [key, item] of entries) {
    const keyWords = key.split(' ').filter(w => w.length > 2);
    if (keyWords.length >= 2) {
      const allWordsPresent = keyWords.every(w => normInput.includes(w));
      if (allWordsPresent) return item;
    }
  }

  return null;
}

/**
 * Generates the Dynamic Literature Context block for the prompt based on selected chapters.
 * If no literature chapters match, returns empty string.
 */
export function getLiteratureContext(className, subjectName, selectedChapters) {
  if (!selectedChapters || !Array.isArray(selectedChapters) || selectedChapters.length === 0) {
    return '';
  }
  // Only the English and Hindi textbooks are summarised here; a Science or
  // General Knowledge chapter such as "Winds" or "Yoga" must not pick up a poem's plot.
  if (subjectName && !/english|hindi/i.test(subjectName)) {
    return '';
  }

  const matchedSummaries = [];
  const seenTitles = new Set();

  for (const chObj of selectedChapters) {
    const rawName = typeof chObj === 'string' ? chObj : (chObj.name || '');
    if (!rawName) continue;

    // Split if there's hierarchy like "Group -> Chapter"
    const parts = rawName.split('->');
    const leafName = parts[parts.length - 1].trim();

    const matched = findLiteratureSummary(leafName, className) || findLiteratureSummary(rawName, className);
    if (matched && !seenTitles.has(matched.title)) {
      seenTitles.add(matched.title);
      matchedSummaries.push(matched);
    }
  }

  if (matchedSummaries.length === 0) {
    return '';
  }

  let text = `**CRITICAL LITERATURE CONTEXT FOR AI (DO NOT HALLUCINATE PLOTS):**\n`;
  text += `*(MANDATORY INSTRUCTION: You MUST strictly adhere to the following verified core plots, characters, and themes for the selected textbook chapters below. Do NOT guess, invent, or hallucinate storylines based on chapter titles)*\n`;

  matchedSummaries.forEach(item => {
    text += `*   **${item.title}**: ${item.summary}\n`;
  });

  return text;
}
