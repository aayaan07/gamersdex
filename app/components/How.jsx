import React from "react";
import ScrollStack, { ScrollStackItem } from "../ui/ScrollStack";

const steps = [
  {
    step: 1,
    title: "Create Your Account",
    subtitle: "Create your gaming profile in minutes",
    description:
      "Sign up with your email and set up your gamer profile in seconds.",
    image: "/card-img1.jpg",
  },
  {
    step: 2,
    title: "Build Your Profile",
    subtitle: "Set up your Gamer profile",
    description:
      "Add an avatar, write a short bio, and customize your public profile that represents you as a gamer.",
    image: "/card-img2.jpg",
  },
  {
    step: 3,
    title: "Add Your Games",
    subtitle: "Add games you’ve played",
    description:
      "Search for games and add them to your profile as played, currently playing, or want to play.",
    image: "/card-img3.jpg",
  },
  {
    step: 4,
    title: "Rate and Organize",
    subtitle: "Rate and organize your games",
    description:
      "Rate games you’ve played, manage your wishlist, and organize everything in one place.",
    image: "/card-img4.jpg",
  },
  {
    step: 5,
    title: "Share Your Profile",
    subtitle: "Share your gaming identity",
    description:
      "Get a public profile link and share it with friends or on social platforms.",
    image: "/card-img5.jpg",
  },
];

const How = () => {
  return (
    <section id="how" className="w-full h-fit py-10 px-4">
      <h1 className="mx-auto w-fit font-almendra text-white text-2xl sm:text-3xl md:text-4xl">
        HOW IT WORKS
      </h1>
      <div className="w-full sm:w-[90%] md:w-[80%] mx-auto py-10 pt-14 sm:pt-20">
        <ScrollStack>
          {steps.map(({ step, title, subtitle, description, image }) => (
            <ScrollStackItem key={step} className="relative overflow-hidden">
              {/* Background image */}
              <img
                src={image}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover rounded-[20px] sm:rounded-[30px] md:rounded-[40px]"
              />
              {/* Gradient overlay */}
              <div className={`${step % 2 !== 0 ? 'step-card-gradient-white' : 'step-card-gradient'} absolute inset-0 rounded-[20px] sm:rounded-[30px] md:rounded-[40px]`} />
              {/* Text content */}
              <div className="relative z-10 flex flex-col justify-center h-full max-w-full sm:max-w-[70%] md:max-w-[55%] px-5 sm:px-10">
                <p className="step-card-label font-poppins">
                  ➡ STEP {step} — {title}
                </p>
                <p className="step-card-subtitle font-poppins">{subtitle}</p>
                <p className="step-card-description font-poppins">
                  {description}
                </p>
              </div>
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
};

export default How;
