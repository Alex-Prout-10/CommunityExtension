import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl || databaseUrl.startsWith('prisma+')) throw new Error('DATABASE_URL must be a direct postgresql:// or postgres:// connection string.')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) })

type SeedQuestion = { prompt: string; explanation: string; options: Array<{ text: string; explanation: string; isCorrect: boolean }> }
type Scenario = { prompt: string; options: string[]; correct: number; explanation: string }

function scenario({ prompt, options, correct, explanation }: Scenario): SeedQuestion {
  if (options.length < 3 || options.length > 4) throw new Error(`Each scenario needs three or four choices: ${prompt}`)
  // Older seed scenarios began with three choices. The fourth is a deliberately unsafe shortcut,
  // so every quiz now presents four answer options without changing any correct answer indexes.
  const fourChoices = options.length === 4 ? options : [...options, 'Act immediately without checking any details']
  return {
    prompt,
    explanation,
    options: fourChoices.map((text, index) => ({ text, isCorrect: index === correct, explanation: `${index === correct ? 'Correct.' : 'Not quite.'} ${explanation}` })),
  }
}

const unescoMilUrl = 'https://www.unesco.org/mil4teachers/en/introduction'
const catalog: Array<{ slug: string; title: string; description: string; questions: SeedQuestion[] }> = [
  {
    slug: 'evaluate-sources', title: 'Check the Source', description: 'Practice checking who created a claim, when it was made, and what evidence supports it.', questions: [
      scenario({ prompt: 'A health tip is being widely shared, but the post does not name an author or source. What should you do first?', options: ['Share it because many people shared it', 'Look for the original source, evidence, and independent confirmation', 'Assume it is false without reading it'], correct: 1, explanation: 'Popularity does not verify a claim. Find who made it, what evidence they use, and whether reliable independent sources agree.' }),
      scenario({ prompt: 'A dramatic video claims to show an event happening today. What detail is most useful to check?', options: ['The number of comments', 'The date, location, original uploader, and reliable coverage', 'Whether the thumbnail looks professional'], correct: 1, explanation: 'Media can be old or removed from its context. Check when and where it originated before drawing conclusions.' }),
      scenario({ prompt: 'A post says, “This is the worst policy ever.” What is the best next question?', options: ['Is this an opinion or a claim that can be checked?', 'Do I already agree with it?', 'Does it use a large font?'], correct: 0, explanation: 'Separate opinions from factual claims. A factual claim can be investigated with evidence; an opinion should be understood as a viewpoint.' }),
    ],
  },
  {
    slug: 'suspicious-links', title: 'Spot Scams & Manipulation', description: 'Recognize urgency, impersonation, and risky links before giving away information or money.', questions: [
      scenario({ prompt: 'A message promises free game currency if you sign in through its link right now. What is safest?', options: ['Sign in before the offer ends', 'Open the game through its official app or saved address instead', 'Send the offer to friends first'], correct: 1, explanation: 'Urgency and rewards can pressure people to act. Use a trusted route you control instead of an unexpected link.' }),
      scenario({ prompt: 'Your bank “freezes” your account and asks you to confirm your password through a text link. What should you do?', options: ['Use the link because the message looks official', 'Call the number in the text', 'Open the bank’s official app or use the number on your card'], correct: 2, explanation: 'Use contact information you already trust. Do not provide credentials through an unexpected message.' }),
      scenario({ prompt: 'A caller says your computer has a virus and needs remote access immediately. What is the best response?', options: ['End the call and contact a trusted support channel yourself', 'Install the program they name', 'Give access while watching closely'], correct: 0, explanation: 'Unexpected tech-support calls can be impersonation attempts. End contact and independently verify any support need.' }),
    ],
  },
  {
    slug: 'understand-ads-persuasion', title: 'Understand Ads & Persuasion', description: 'Recognize when content is trying to sell, influence, or pressure you.', questions: [
      scenario({ prompt: 'A creator praises a product and includes an “affiliate link” in the caption. What does that tell you?', options: ['The post may include a financial incentive', 'The product is automatically unsafe', 'The creator cannot have used the product'], correct: 0, explanation: 'Affiliate links can compensate a creator. That does not make content false, but it is useful context when judging a recommendation.' }),
      scenario({ prompt: 'A shopping page shows “Only 2 minutes left!” beside a large discount. What is a careful response?', options: ['Buy immediately to avoid missing out', 'Pause, compare the offer, and check whether the timer or claim is credible', 'Assume every timer is illegal'], correct: 1, explanation: 'Countdowns can create pressure. A pause gives you time to evaluate price, seller, and need.' }),
      scenario({ prompt: 'A post looks like helpful advice but is labeled “Sponsored.” What should you remember?', options: ['It is an advertisement and may have a persuasive purpose', 'It cannot contain useful information', 'It is the same as independent reporting'], correct: 0, explanation: 'Sponsored content can be useful, but its commercial purpose is relevant context.' }),
    ],
  },
  {
    slug: 'protect-privacy', title: 'Protect Privacy', description: 'Practice deciding what information to share and how to keep accounts safer.', questions: [
      scenario({ prompt: 'An online quiz asks for your full name, birthday, school, and home address before showing a result. What is best?', options: ['Provide everything because quizzes are harmless', 'Share only what is necessary, or leave if the request does not make sense', 'Use the same password you use everywhere'], correct: 1, explanation: 'Consider whether each request is necessary. Personal details can be combined to identify, contact, or profile you.' }),
      scenario({ prompt: 'An unfamiliar app asks for your microphone, contacts, camera, and location before it will open. What should you do?', options: ['Grant every permission automatically', 'Review whether each permission is needed for the app’s purpose', 'Post your password in a review'], correct: 1, explanation: 'Permissions should match what an app needs to do. Unnecessary access is a reason to pause and investigate.' }),
      scenario({ prompt: 'Why is reusing one password across many accounts risky?', options: ['It makes your keyboard slower', 'One compromised account could expose other accounts', 'It prevents password managers from working'], correct: 1, explanation: 'Unique passwords limit the damage if one service suffers a breach or phishing attempt.' }),
    ],
  },
  {
    slug: 'ai-media-verification', title: 'Verify AI & Media', description: 'Use source, context, and corroboration when evaluating potentially synthetic media.', questions: [
      scenario({ prompt: 'You receive a voice message that sounds like a relative asking for emergency money. What should you do first?', options: ['Send money because the voice sounds familiar', 'Contact the person using a number you already know', 'Share the message publicly'], correct: 1, explanation: 'Voice can be imitated. Verify an urgent request through an independent, trusted contact method.' }),
      scenario({ prompt: 'A video makes an extraordinary claim about a current event. What is a strong verification step?', options: ['Check the original source, date, location, and independent reporting', 'Decide from the thumbnail', 'Share it because it is emotional'], correct: 0, explanation: 'Source, time, place, and independent corroboration are more reliable than visual impressions alone.' }),
      scenario({ prompt: 'A post labels an image “AI-generated.” What is the best response?', options: ['Treat the label as complete proof', 'Use the label as one clue and check source and context', 'Assume all AI media is harmful'], correct: 1, explanation: 'A label is useful context, but verification considers multiple pieces of evidence.' }),
    ],
  },
  {
    slug: 'participate-respectfully', title: 'Participate Respectfully', description: 'Think about representation, fairness, and the effect of what you share online.', questions: [
      scenario({ prompt: 'A meme makes a broad negative claim about a group of people. What is a responsible next step?', options: ['Share it because it is popular', 'Pause, consider who may be harmed, and check whether the claim is fair and supported', 'Add a harsher comment'], correct: 1, explanation: 'Responsible participation considers accuracy, representation, and the impact content can have on others.' }),
      scenario({ prompt: 'A rumor about a classmate is spreading in a group chat. What should you do?', options: ['Forward it with a question mark', 'Avoid spreading it and encourage checking with a trusted adult or source', 'Add details to make it interesting'], correct: 1, explanation: 'Unverified rumors can harm people. Do not amplify them just because they are circulating.' }),
      scenario({ prompt: 'A story about a community includes only one viewpoint. What can improve your understanding?', options: ['Look for additional perspectives and reliable sources', 'Assume one viewpoint tells the whole story', 'Ignore the topic completely'], correct: 0, explanation: 'Seeking multiple relevant perspectives can reveal context and reduce oversimplification.' }),
    ],
  },
  {
    slug: 'social-media-safety', title: 'Social Media Safety', description: 'Practice protecting privacy and participating safely in chats, comments, and public posts.', questions: [
      scenario({ prompt: 'Before posting a photo of a friend in a public group, what should you do?', options: ['Post it quickly so more people see it', 'Ask for their permission and check who can view the post', 'Add their location to make it more interesting'], correct: 1, explanation: 'Respecting another person’s privacy includes asking before sharing their image or personal information and checking the audience.' }),
      scenario({ prompt: 'A group-chat friend asks for your address and phone number. What is the safest response?', options: ['Share it so they trust you', 'Pause and share personal details only when necessary with someone you can verify', 'Post the details in the group so nobody forgets'], correct: 1, explanation: 'Personal details can be copied, shared, and misused. Consider why the information is needed and who will receive it.' }),
      scenario({ prompt: 'You disagree with someone in a comment section. What is a media-literate way to respond?', options: ['Attack them personally', 'Reply with a respectful question or leave the conversation if it is becoming harmful', 'Forward their comment to embarrass them'], correct: 1, explanation: 'Responsible participation protects dignity and helps keep conversation focused on ideas, evidence, and fairness.' }),
    ],
  },
]

// Seven additional scenarios per lesson give learners ten unique situations to practice.
// They are short, concrete decisions based on UNESCO MIL themes: source/context, privacy,
// persuasion, AI/media verification, and respectful participation.
const reinforcement: Record<string, Scenario[]> = {
  'evaluate-sources': [
    { prompt: 'A post quotes a “study” but gives no link or organization. What is the best first step?', options: ['Find the original study or a reliable report about it', 'Assume the quote is accurate', 'Judge it only by the account’s follower count', 'Share it with a warning'], correct: 0, explanation: 'A claim about research should lead back to the original evidence or trustworthy coverage that identifies it.' },
    { prompt: 'Two sites report different numbers about the same event. What should you check?', options: ['Which headline is more dramatic', 'The date, original data, methods, and reporting from multiple credible sources', 'Which site you visited first', 'Which number is easier to remember'], correct: 1, explanation: 'Differences may come from dates, methods, or errors. Compare evidence and context rather than choosing by style.' },
    { prompt: 'A headline says “Experts agree,” but names no experts. What is a careful response?', options: ['Treat it as proven', 'Look for named experts, their expertise, and the evidence they cite', 'Assume unnamed experts are protecting privacy', 'Share it because experts were mentioned'], correct: 1, explanation: 'Authority claims are stronger when you can identify the source and assess relevant expertise and evidence.' },
    { prompt: 'You find an old article reposted as if it were new. What should you do?', options: ['Check its original publication date and current relevance', 'Use it as proof of today’s situation', 'Ignore the date because facts never change', 'Add a newer-looking picture'], correct: 0, explanation: 'Information can become misleading when it is removed from its original time and context.' },
    { prompt: 'A creator says “This is just my opinion.” What should you still consider?', options: ['Whether opinion is separated from factual claims and evidence', 'That opinions never affect others', 'That no source check is needed', 'That all opinions are equally informed'], correct: 0, explanation: 'Opinions are valid viewpoints, but factual statements within them can still be checked.' },
    { prompt: 'A page has no author but does link to a public organization and source documents. What is fair?', options: ['Consider the linked evidence while noting the missing author', 'Call it automatically false', 'Trust it without opening sources', 'Only judge the page colors'], correct: 0, explanation: 'Missing details are a cue to investigate, not automatic proof that a source is wrong.' },
    { prompt: 'Before sharing a major claim, which is the strongest habit?', options: ['Read beyond the headline and compare reliable sources', 'Share first and correct it later', 'Use only comments as evidence', 'Choose the post with the most emojis'], correct: 0, explanation: 'Reading context and checking independent coverage reduces accidental amplification of false information.' },
  ],
  'suspicious-links': [
    { prompt: 'An email says your delivery failed and asks you to pay a small fee through a link. What should you do?', options: ['Use the delivery company’s official app or typed web address', 'Pay quickly to avoid a return', 'Reply with your address and card number', 'Forward the link to family'], correct: 0, explanation: 'Unexpected payment links can impersonate delivery services. Use a contact route you already trust.' },
    { prompt: 'A QR code on a poster promises a prize if you scan it. What is safest?', options: ['Check who posted it and where the code leads before entering details', 'Scan and sign in immediately', 'Assume QR codes are always safe', 'Post a photo of your ID to claim the prize'], correct: 0, explanation: 'A QR code hides its destination just like a shortened link can.' },
    { prompt: 'A website pop-up says “Virus detected! Call now!” What should you do?', options: ['Close it and use trusted security tools or support', 'Call the number shown', 'Install the pop-up’s suggested program', 'Give remote access to fix it'], correct: 0, explanation: 'Scare tactics and urgent support requests are common scam patterns.' },
    { prompt: 'A friend’s account sends a strange link with no explanation. What is wise?', options: ['Verify with your friend another way before opening it', 'Open it because you know the friend', 'Enter your password if asked', 'Send it to more people'], correct: 0, explanation: 'Accounts can be compromised. Verify unexpected messages through a separate trusted channel.' },
    { prompt: 'A link’s visible text says a bank name but its web address is different. What does that mean?', options: ['Pause; the displayed name may be disguising the destination', 'It proves the bank approved it', 'It is safe if the colors match', 'Passwords are safe to enter there'], correct: 0, explanation: 'A mismatch between visible text and actual destination is a strong reason not to proceed.' },
    { prompt: 'A giveaway asks you to “verify” your account with a one-time code. What should you do?', options: ['Never share a one-time security code with an unexpected requester', 'Send the code quickly', 'Post the code in comments', 'Reuse an old code instead'], correct: 0, explanation: 'Security codes can be used to take over accounts. Legitimate services do not ask unexpected contacts for them.' },
    { prompt: 'A site asks for payment before revealing an “urgent” public-service message. What is best?', options: ['Find the service through an official government or organization site', 'Pay before the countdown ends', 'Trust it because it uses official-looking logos', 'Send the link to everyone'], correct: 0, explanation: 'Use independent, trusted routes for public services rather than a pressured link.' },
  ],
  'understand-ads-persuasion': [
    { prompt: 'A product page says “Only 1 left!” What is a careful next step?', options: ['Pause and compare price, seller, and return policy', 'Buy immediately without reading', 'Assume stock messages are always false', 'Share your payment details in chat'], correct: 0, explanation: 'Scarcity messages can create pressure. A pause helps you make an informed decision.' },
    { prompt: 'A review page earns money when readers purchase through its links. What should you consider?', options: ['It may have a commercial incentive, so compare independent information', 'Every review must be false', 'The links prove the product is best', 'No other sources are needed'], correct: 0, explanation: 'Commercial incentives are useful context, not automatic proof of dishonesty.' },
    { prompt: 'An ad uses before-and-after photos without explaining results. What is best?', options: ['Look for evidence, limitations, and independent information', 'Assume photos prove the claim', 'Buy because the photos look polished', 'Share the photos as medical advice'], correct: 0, explanation: 'Visuals can persuade strongly but do not replace evidence or context.' },
    { prompt: 'A creator says a product “changed my life.” What kind of statement is that?', options: ['A personal testimonial that may not apply to everyone', 'Scientific proof for all people', 'A guarantee from a public authority', 'A reason to skip research'], correct: 0, explanation: 'Testimonials can be meaningful experiences, but they are not the same as broad evidence.' },
    { prompt: 'A game advert offers a “free” item but asks for many permissions. What should you do?', options: ['Review whether the data request matches the offer', 'Accept every permission automatically', 'Give a parent’s password', 'Assume free means no cost'], correct: 0, explanation: 'Free services can have data or attention costs; evaluate what you are being asked to provide.' },
    { prompt: 'A sale timer resets when you refresh the page. What should you infer?', options: ['The timer may be designed to create pressure rather than reflect a real deadline', 'You must buy faster', 'The product is automatically illegal', 'The price cannot be compared'], correct: 0, explanation: 'Pressure cues are a reason to slow down and independently compare an offer.' },
    { prompt: 'Why should sponsored content be labeled clearly?', options: ['So people can recognize its commercial purpose', 'So it becomes automatically untrustworthy', 'So people never need to think critically', 'So it can hide who paid for it'], correct: 0, explanation: 'Clear labels help people evaluate a message with its purpose and incentives in mind.' },
  ],
  'protect-privacy': [
    { prompt: 'A site requests your location to show a simple article. What should you do?', options: ['Ask whether location is necessary before allowing it', 'Allow it because every site needs it', 'Post your home address instead', 'Share a family member’s location'], correct: 0, explanation: 'Permissions should match the purpose of the service.' },
    { prompt: 'What is a digital footprint?', options: ['Information and traces created by online activity', 'Only a password record', 'A type of computer virus', 'A private message that disappears everywhere'], correct: 0, explanation: 'Posts, likes, searches, photos, and interactions can leave lasting traces.' },
    { prompt: 'A quiz asks for your mother’s maiden name and birthday. What is safest?', options: ['Avoid sharing details that could help someone answer security questions', 'Give exact answers for fun', 'Use your real password too', 'Post the answers publicly'], correct: 0, explanation: 'Seemingly harmless details can be combined to identify or impersonate someone.' },
    { prompt: 'A friend posts a photo showing your location. What can you do?', options: ['Ask them to remove it or adjust its audience if you are uncomfortable', 'Assume you have no say', 'Add your address in the comments', 'Share more location details'], correct: 0, explanation: 'Respectful privacy includes discussing consent and visibility of information about others.' },
    { prompt: 'Which password practice is strongest?', options: ['Use a unique, long password for each account with a password manager if possible', 'Reuse one short password everywhere', 'Send passwords to friends', 'Use your name and birthday'], correct: 0, explanation: 'Unique passwords reduce the damage if one account is compromised.' },
    { prompt: 'An app wants contacts but its main feature is a flashlight. What should you do?', options: ['Deny or question unnecessary access', 'Grant every permission', 'Upload your contact list manually', 'Share another person’s contacts'], correct: 0, explanation: 'Permissions should be necessary and proportionate to the app’s function.' },
    { prompt: 'Before using a new privacy setting, what should you check?', options: ['Who can see your information and whether the setting matches your goal', 'Only the icon color', 'Whether friends already accepted it', 'Whether it asks for more personal data'], correct: 0, explanation: 'Privacy settings are useful when you understand the audience and data they control.' },
  ],
  'ai-media-verification': mediaVerificationScenarios(),
  'participate-respectfully': respectfulParticipationScenarios(),
  'social-media-safety': socialSafetyScenarios(),
}

function mediaVerificationScenarios(): Scenario[] {
  return [
    ['A realistic image makes you angry. What should you do before sharing it?', 'Check its source, date, and reliable reporting', 'Share it while emotions are high'],
    ['A video has no source but claims a celebrity said something shocking. What is strongest?', 'Look for the original full video and independent reporting', 'Trust clipped captions'],
    ['Why is reverse-image searching useful?', 'It can help find earlier uses and original context', 'It proves every image is fake'],
    ['An AI label appears beside a picture. What does it tell you?', 'It is a clue, and related claims still need checking', 'Everything beside it is automatically false'],
    ['A deepfake warning is missing from a video. What should you conclude?', 'Nothing certain; look for source and corroboration', 'It must be real'],
    ['A familiar face on a video call asks for money. What is safest?', 'Verify through an independent contact method', 'Send money because the face looks familiar'],
    ['What makes an extraordinary media claim more credible?', 'Clear source, date, location, evidence, and independent confirmation', 'A dramatic soundtrack'],
  ].map(([prompt, safe, unsafe]) => ({ prompt, options: [safe, unsafe, 'Decide from the thumbnail alone', 'Forward it before checking'], correct: 0, explanation: 'Source, context, and independent corroboration are stronger evidence than realistic appearance or popularity.' }))
}

function respectfulParticipationScenarios(): Scenario[] {
  return [
    ['Someone makes a mistake in a public post. What is constructive?', 'Correct it respectfully with evidence if appropriate', 'Mock them in comments'],
    ['A post stereotypes a community. What should you consider?', 'Whether it is fair, supported, and likely to harm people', 'Whether it is popular'],
    ['A discussion becomes hostile. What is healthy?', 'Set a boundary, report abuse when needed, or leave', 'Escalate with threats'],
    ['Why ask before reposting someone’s personal story?', 'They may not want wider sharing or loss of context', 'Stories always belong to everyone'],
    ['You see a rumor targeting a classmate. What is responsible?', 'Do not amplify it; seek reliable clarification or support', 'Add guesses'],
    ['What can broaden your understanding of a disputed issue?', 'Seek relevant perspectives and credible sources', 'Read only people who agree with you'],
    ['A friend asks you to post something cruel “as a joke.” What is best?', 'Decline and consider the likely impact', 'Post it to fit in'],
  ].map(([prompt, safe, unsafe]) => ({ prompt, options: [safe, unsafe, 'Share private details about others', 'Invite strangers to attack'], correct: 0, explanation: 'Responsible participation considers accuracy, dignity, representation, and the effect a post can have on others.' }))
}

function socialSafetyScenarios(): Scenario[] {
  return [
    ['A stranger asks you to move a conversation to a private app immediately. What is wise?', 'Pause, verify who they are, and keep boundaries', 'Share your private account right away'],
    ['A public post asks for your first pet’s name. What should you remember?', 'It may collect answers used in security questions', 'It is always harmless fun'],
    ['Before tagging someone in a photo, what should you check?', 'Their permission and whether the audience is appropriate', 'Whether tagging gets more likes'],
    ['Someone asks for a private image and promises secrecy. What is safest?', 'Do not share it; images can be copied or redistributed', 'Send it if they promise'],
    ['A new follower claims to attend your school. What is careful?', 'Verify through a trusted route before sharing personal information', 'Send your schedule'],
    ['Why review who can reply to or message you?', 'It helps control unwanted contact and visibility', 'It makes every message false'],
    ['You feel pressured to share a secret in group chat. What is best?', 'Pause; you can keep personal information private', 'Share it to avoid being left out'],
  ].map(([prompt, safe, unsafe]) => ({ prompt, options: [safe, unsafe, 'Send account codes as proof', 'Post another person’s private information'], correct: 0, explanation: 'Privacy settings, consent, and personal boundaries help people participate more safely online.' }))
}

async function main() {
  for (const categoryData of catalog) {
    const questions = [...categoryData.questions, ...(reinforcement[categoryData.slug] ?? []).map(scenario)]
    await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {
        title: categoryData.title,
        description: categoryData.description,
        sourceUrl: unescoMilUrl,
        questions: {
          deleteMany: {},
          create: questions.map((question) => ({
            prompt: question.prompt,
            explanation: question.explanation,
            sourceUrl: unescoMilUrl,
            options: { create: question.options.map((option, position) => ({ ...option, position })) },
          })),
        },
      },
      create: {
        slug: categoryData.slug,
        title: categoryData.title,
        description: categoryData.description,
        sourceUrl: unescoMilUrl,
        questions: {
          create: questions.map((question) => ({
            prompt: question.prompt,
            explanation: question.explanation,
            sourceUrl: unescoMilUrl,
            options: { create: question.options.map((option, position) => ({ ...option, position })) },
          })),
        },
      },
    })
  }
  console.log(`Seeded ${catalog.length} media-and-information-literacy categories.`)
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1 }).finally(async () => prisma.$disconnect())
