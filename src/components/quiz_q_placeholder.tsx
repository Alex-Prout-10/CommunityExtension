
type Question = {
  question: string;
  choices: string[][];
  answer: number;
};

const question1 = {
    question: "What do you check to make sure the information on the website is true?",
    choices: [ 
        ["Author Name", "While we want to make sure they are credible, we look at more than just the author's name."], 
        ["Sources", "Yes! We want to ensure all the information on the site comes from credible sources."], 
        ["Today's Date", "Today's date can't verify if the site is credible."]
    ],
    answer: 1
};

const question2 = {
    question: "How can you tell if an image is AI generated?",
    choices: [ 
        ["The text in the image makes no sense", "Yes, there is often unreadable letters on signs or shirts in an AI generated image, but the other option is also possible."], 
        ["Objects seem unnaturally smooth", "Yes, surfaces are often emphasized to an unnatural texture in an AI generated image, but the other option is also possible."], 
        ["Both are correct", "Both random unreadable text and unnaturally smooth surfaces are signs that an image is AI generated!"]
    ],
    answer: 2
};

const question3 = {
    question: "CAT 1  :D",
    choices: [ 
        ["this is correct", "swEEEEEt"], 
        ["a2", ""], 
        ["a3", ""]
    ],
    answer: 0
};

const question4 = {
    question: "CAT 1 whAAAAA?",
    choices: [ 
        ["a1", ""], 
        ["correct", "yep good job bro"], 
        ["a3", ""]
    ],
    answer: 1
};

const question5 = {
    question: "CAT 2 testing",
    choices: [ 
        ["a1", ""], 
        ["correct", "yep good job bro"], 
        ["a3", ""]
    ],
    answer: 1
};

const question6 = {
    question: "CAT 2  hmmmmmm",
    choices: [ 
        ["a1", ""], 
        ["a2", ""], 
        ["correct", "yep good job bro"]
    ],
    answer: 2
};

const question7 = {
    question: "CAT 2  placeholder",
    choices: [ 
        ["a1", ""], 
        ["correct", "yep good job bro"], 
        ["a3", ""]
    ],
    answer: 1
};

const question8 = {
    question: "CAT 2  qq",
    choices: [ 
        ["correct", "yep good job bro"], 
        ["a2", "nah"], 
        ["a3", ""]
    ],
    answer: 0
};

type Category = {
  name: string;
  description: string;
  questions: Question[];
};

const category1 = {
    name: "False Info",
    description: "TODO",
    questions: [question1, question2, question3, question4]
};

const category2 = {
    name: "AI Images",
    description: "TODO",
    questions: [question5, question6, question7, question8]
};

export const listOfCats: Category[] = [
  category1,
  category2,
];