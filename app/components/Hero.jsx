import Link from "next/link";

export default function Hero() {
    return (
        <section className="flex items-center justify-center px-8 py-24 pb-16 overflow-hidden pb-40">
            <div className="w-full mx-auto flex flex-col items-center gap-12 relative z-100">
                {/* Hero Content */}
                <div className="text-center flex flex-col items-center gap-6">
                    <h1 className="font-uncial text-[clamp(2.5rem,5vw,4rem)] font-normal leading-tight gradient-hero-text m-0 tracking-wide">
                        Your gaming profile <br />all in one place
                    </h1>
                    <p className="font-poppins text-[clamp(1rem,2vw,1.25rem)] font-light text-white/70 m-0">
                        Track and organize your gaming journey all in one place
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex gap-4 mt-4 flex-wrap justify-center">
                        <Link href="/create">
                            <button className="btn-primary">
                                Get Started
                            </button>
                        </Link>
                        <Link href="#why">
                            <button className="btn-sec">
                                Learn More
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Hero Image */}

            </div>
        </section>
    );
}
