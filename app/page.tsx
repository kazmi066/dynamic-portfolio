import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { portfolioData } from "@/portfolioData";

export default function Home() {
  const data = portfolioData;

  return (
    <div>
      {/* Header */}
      <header className="sticky inset-x-0 top-0 z-50 flex w-full flex-wrap text-sm md:flex-nowrap md:justify-start">
        <nav className="relative mx-2 mt-4 w-full max-w-2xl rounded-4xl border bg-background/70 py-2.5 backdrop-blur sm:mx-auto sm:flex sm:items-center sm:justify-between sm:px-4 sm:py-0">
          <div className="flex items-center justify-between px-4 md:px-0">
            <div className="flex items-center">
              <Link
                className="inline-block flex-none rounded-md text-xl font-bold focus:opacity-80 focus:outline-none"
                href="/"
                aria-label="Portfolio">
                Portfolio
              </Link>
            </div>
          </div>

          <div className="hs-collapse hidden grow basis-full overflow-hidden transition-all duration-300 sm:block">
            <div className="mt-3 flex flex-col gap-2 py-2 sm:mt-0 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:py-0 sm:ps-7">
              {data.navigation.map((link) => (
                <a
                  key={link.label}
                  className={cn(
                    "border-s-2 border-transparent px-4 py-0.5 text-muted-foreground hover:text-foreground focus:outline-none sm:border-b-2 sm:border-s-0 sm:px-1 sm:py-3",
                    {
                      "border-foreground font-medium text-foreground":
                        link.active,
                    }
                  )}
                  href={link.link}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main id="content">
        <div className="mx-auto w-full max-w-2xl px-4 pt-10 sm:px-6 md:pt-16 lg:px-8">
          {/* Personal Info */}
          <div className="flex items-center gap-x-3">
            <div className="shrink-0">
              <Image
                className="size-16 shrink-0 rounded-full object-cover"
                src={data.personal.avatar}
                alt={data.personal.name}
                width={64}
                height={64}
              />
            </div>

            <div className="grow">
              <h1 className="text-lg font-medium text-foreground">
                {data.personal.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {data.personal.title}
              </p>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-8">
            {data.personal.bio.map((paragraph, idx) => (
              <p
                key={idx}
                className={cn("text-sm text-muted-foreground", {
                  "mt-3": idx > 0,
                })}>
                {paragraph}
              </p>
            ))}

            {/* Contacts */}
            <ul className="mt-5 flex flex-col gap-y-3">
              {data.contacts.map((contact) => (
                <li key={contact.name} className="flex items-center gap-x-2.5">
                  <svg
                    className="size-3.5 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                  <a
                    className="text-[13px] text-muted-foreground underline hover:text-foreground hover:decoration-2 focus:decoration-2 focus:outline-none"
                    href={contact.link}>
                    {contact.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Projects */}
          {data.projects.length > 0 && (
            <div className="mt-10 sm:mt-14" id="projects">
              <h2 className="mb-5 font-medium text-foreground">Projects</h2>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {data.projects.map((project) => (
                  <a
                    key={project.title}
                    className="group relative block overflow-hidden rounded-lg"
                    href={project.link}>
                    <Image
                      className="size-40 w-full rounded-lg bg-gray-100 object-cover dark:bg-neutral-800"
                      src={project.image}
                      alt={project.title}
                      width={160}
                      height={160}
                    />
                    <div className="absolute bottom-1 end-1 opacity-0 transition group-hover:opacity-100">
                      <div className="flex items-center gap-x-1 rounded-lg border bg-white px-2 py-1 text-gray-800 dark:bg-neutral-900 dark:text-neutral-200">
                        <svg
                          className="size-3 shrink-0"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        <span className="text-xs">View</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials */}
          {data.testimonials.length > 0 && (
            <div className="mt-10 sm:mt-14">
              <h2 className="mb-3 font-medium text-foreground">Testimonials</h2>

              <div className="grid grid-cols-1 gap-x-3 divide-y divide-gray-200 border-y dark:divide-neutral-700 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                {data.testimonials.map((testimonial, idx) => (
                  <div
                    key={testimonial.name}
                    className={cn("py-6 sm:px-4", {
                      "sm:-ms-4": idx === 0,
                    })}>
                    <blockquote>
                      <span className="text-sm text-foreground">
                        {testimonial.content}
                      </span>

                      <footer className="mt-3">
                        <div className="flex items-center gap-x-2">
                          <Image
                            className="size-5 shrink-0 rounded-full"
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            width={32}
                            height={32}
                          />
                          <div className="grow">
                            <div className="text-xs text-muted-foreground">
                              {testimonial.name}
                            </div>
                          </div>
                        </div>
                      </footer>
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <div className="my-10 sm:my-14">
              <h2 className="mb-5 font-medium text-foreground">Skills</h2>

              <div className="space-y-3">
                {data.skills.map((skill) => (
                  <dl
                    key={skill.category}
                    className="flex flex-col gap-1 sm:flex-row">
                    <dt className="min-w-40">
                      <span className="block text-sm text-muted-foreground">
                        {skill.category}:
                      </span>
                    </dt>
                    <dd>
                      <ul>
                        {skill.items.map((item) => (
                          <li
                            key={item}
                            className="me-1 inline-flex items-center text-sm text-foreground after:content-[','] last:after:content-['']">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </dl>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {data.workExperience.length > 0 && (
            <div className="mt-10 sm:mt-14" id="work">
              <h2 className="mb-5 font-medium text-foreground">
                Work experience
              </h2>

              <div>
                {data.workExperience.map((job) => (
                  <div
                    key={`${job.company}-${job.period}-${job.role}`}
                    className="group relative flex gap-x-5">
                    <div className="relative after:absolute after:bottom-2 after:start-3 after:top-8 after:w-px after:-translate-x-[0.5px] after:bg-gray-200 group-last:after:hidden dark:after:bg-neutral-700">
                      <div className="relative z-10 flex size-6 items-center justify-center">
                        <div className="size-2 rounded-full bg-gray-400 dark:bg-neutral-600"></div>
                      </div>
                    </div>

                    <div className="grow pb-8 group-last:pb-0">
                      <h3 className="mb-1 text-xs text-muted-foreground">
                        {job.period}
                      </h3>

                      <p className="text-sm font-semibold text-foreground">
                        {job.role} at {job.company}
                      </p>

                      {job.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {job.description}
                        </p>
                      )}

                      {job.responsibilities && (
                        <ul className="ms-6 mt-3 list-disc space-y-1.5">
                          {job.responsibilities.map((resp) => (
                            <li
                              key={resp}
                              className="ps-1 text-sm text-muted-foreground">
                              {resp}
                            </li>
                          ))}
                        </ul>
                      )}

                      {job.featuredWork && (
                        <div className="mt-3">
                          <a
                            className="block rounded-lg border hover:shadow-sm focus:outline-none"
                            href={job.featuredWork.link}>
                            <div className="relative flex items-center overflow-hidden">
                              <Image
                                className="absolute inset-0 h-full w-32 rounded-s-lg object-cover sm:w-48"
                                src={job.featuredWork.image}
                                alt={job.featuredWork.title}
                                width={192}
                                height={192}
                              />

                              <div className="ms-32 grow p-4 sm:ms-48">
                                <div className="flex min-h-24 flex-col justify-center">
                                  <h3 className="text-sm font-semibold text-gray-800 dark:text-neutral-300">
                                    {job.featuredWork.title}
                                  </h3>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {job.featuredWork.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div className="mt-10 sm:mt-14">
              <h2 className="mb-3 font-medium text-foreground">Education</h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {data.education.map((edu) => (
                  <div
                    key={`${edu.institution}-${edu.degree}`}
                    className="rounded-lg border p-4">
                    {edu.logo && (
                      <Image
                        className="mb-3 size-10 shrink-0 object-contain"
                        src={edu.logo}
                        alt={edu.institution}
                        width={40}
                        height={40}
                      />
                    )}

                    <h3 className="mb-1 text-xs text-muted-foreground">
                      {edu.period}
                    </h3>

                    <p className="text-sm font-semibold text-foreground">
                      {edu.degree}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {edu.institution}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Articles */}
          {data.articles.length > 0 && (
            <div className="my-10 sm:my-14" id="articles">
              <h2 className="mb-5 font-medium text-foreground">Articles</h2>

              <ul className="space-y-10">
                {data.articles.map((article) => (
                  <li key={article.title}>
                    <p className="mb-2 text-sm text-muted-foreground">
                      {article.year}
                    </p>
                    <h5 className="text-sm font-medium text-foreground">
                      {article.title}
                    </h5>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {article.description}
                    </p>
                    <p className="mt-1">
                      <a
                        className="text-sm text-muted-foreground underline hover:text-foreground hover:decoration-2 focus:decoration-2 focus:outline-none"
                        href={article.link}>
                        Continue reading
                      </a>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Newsletter */}
          {data.newsletter.enabled && (
            <div className="my-10 sm:my-14">
              <h2 className="mb-5 font-medium text-foreground">
                {data.newsletter.title}
              </h2>

              <form>
                <div className="flex flex-col items-center gap-2 rounded-lg border p-1.5 sm:flex-row">
                  <div className="relative w-full">
                    <label htmlFor="hero-input" className="sr-only">
                      Subscribe
                    </label>
                    <div className="pointer-events-none absolute inset-y-0 start-0 z-20 flex items-center ps-3">
                      <svg
                        className="size-4 shrink-0 text-muted-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                      </svg>
                    </div>
                    <Input
                      type="email"
                      id="hero-input"
                      name="hero-input"
                      className="py-2 pe-3 ps-9"
                      placeholder={data.newsletter.placeholder}
                    />
                  </div>
                  <Button type="button" size="sm">
                    {data.newsletter.buttonText}
                    <svg
                      className="size-3.5 shrink-0"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="m12 5 7 7-7 7"></path>
                    </svg>
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {data.newsletter.disclaimer}
                </p>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="border-t py-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">
                {data.footer.copyright}
              </p>
            </div>

            <ul className="flex flex-wrap items-center">
              {data.footer.socialLinks.map((social) => (
                <li
                  key={social.name}
                  className={cn(
                    "relative inline-block pe-4 text-xs",
                    "before:absolute before:end-1.5 before:top-1/2 before:size-[3px] before:-translate-y-1/2 before:rounded-full before:bg-gray-400",
                    "last:pe-0 last-of-type:before:hidden dark:before:bg-neutral-600"
                  )}>
                  <a
                    className="text-xs text-muted-foreground underline hover:text-foreground hover:decoration-2 focus:decoration-2 focus:outline-none"
                    href={social.link}>
                    {social.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
