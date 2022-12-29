const faqs = [
  {
    question: "Question 1",
    answer:
      "Answer 1: Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    question: "Question 2",
    answer:
      "Answer 2: I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    question: "Question 3",
    answer:
      "Answer 3: I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    question: "Question 4",
    answer:
      "Answer 1: Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    question: "Question 5",
    answer:
      "Answer 2: I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
  {
    question: "Question 6",
    answer:
      "Answer 3: I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat.",
  },
];

export default function FAQ() {
  return (
    <div className="mx-auto max-w-7xl py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
      <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
        Frequently asked questions
      </h2>
      <div className="mt-12">
        <dl className="space-y-10 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-12 md:space-y-0 lg:grid-cols-3">
          {faqs.map((faq, index) => (
            <div key={index}>
              <dt className="text-lg font-medium leading-6 text-gray-900">
                {faq.question}
              </dt>
              <dd className="mt-2 text-base text-gray-500">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
