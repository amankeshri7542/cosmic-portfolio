"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { containsAbusiveWord } from "@/lib/abusiveWords";
import { profile } from "@/lib/portfolio";
type FormData = { name: string; email: string; message: string };
export default function ContactContent() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [error, setError] = useState("");
  const router = useRouter();
  const send = async (data: FormData) => {
    setError("");
    if (containsAbusiveWord(data.name) || containsAbusiveWord(data.message)) {
      setError("Please keep your message respectful.");
      return;
    }
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(
          result.error ||
            "Your message could not be sent. Please try again or email me directly.",
        );
        return;
      }
      router.push("/thank-you");
    } catch {
      setError(
        "Your message could not be sent. Check your connection or email me directly.",
      );
    }
  };
  return (
    <main id="main-content" className="reading-page section-shell contact-page">
      <header className="page-heading">
        <p className="eyebrow">Start a conversation</p>
        <h1>
          A thought, a project,
          <br />
          <em>or just hello.</em>
        </h1>
      </header>
      <div className="contact-grid">
        <div className="contact-information">
          <a className="text-link" href={`mailto:${profile.email}`}>
            {profile.email} ↗
          </a>
          <p>
            A project, an engineering challenge, or a thoughtful conversation.
            Tell me what you have in mind.
          </p>
          <p>Bengaluru, India.</p>
          <div className="text-links">
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub ↗
            </a>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn ↗
            </a>
            <a href={profile.resume} target="_blank" rel="noopener noreferrer">
              Resume ↗
            </a>
          </div>
          <div className="contact-postmark"><span className="handwritten">Your side<br />of the universe.</span><p className="micro">Correspondence welcome</p></div>
        </div>
        <form
          className="contact-form"
          onSubmit={handleSubmit(send)}
          aria-busy={isSubmitting}
          noValidate
        >
          <div>
            <label htmlFor="name">Your name</label>
            <input
              id="name"
              autoComplete="name"
              placeholder="How should I call you?"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              {...register("name", {
                required: "Please enter your name.",
                minLength: {
                  value: 2,
                  message: "Please use at least 2 characters.",
                },
                maxLength: {
                  value: 100,
                  message: "Please keep your name under 100 characters.",
                },
              })}
            />
            {errors.name && (
              <p id="name-error" className="field-error">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              {...register("email", {
                required: "Please enter your email address.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address.",
                },
              })}
            />
            {errors.email && (
              <p id="email-error" className="field-error">
                {errors.email.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="message">What are you thinking?</label>
            <textarea
              id="message"
              placeholder="A little context goes a long way."
              rows={5}
              aria-invalid={!!errors.message}
              aria-describedby={errors.message ? "message-error" : undefined}
              {...register("message", {
                required: "Please write a message.",
                minLength: {
                  value: 10,
                  message:
                    "Please share a little more — at least 10 characters.",
                },
                maxLength: {
                  value: 5000,
                  message: "Please keep your message under 5,000 characters.",
                },
              })}
            />
            {errors.message && (
              <p id="message-error" className="field-error">
                {errors.message.message}
              </p>
            )}
          </div>
          {error && (
            <p className="form-status" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="primary-link"
          >
            {isSubmitting ? "Sending…" : "Send message"}{" "}
            <span aria-hidden="true">↗</span>
          </button>
          <p className="form-note">Your message goes directly to my inbox.</p>
        </form>
      </div>
    </main>
  );
}
