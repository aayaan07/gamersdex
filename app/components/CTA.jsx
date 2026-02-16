import React from 'react'

const CTA = () => {
    return (
        <section className="w-full py-14 sm:py-20 px-4" style={{ background: 'transparent' }}>
            <div
                className="w-[90%] sm:w-[80%] md:w-[70%] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 px-5 sm:px-10 py-10 sm:py-14 md:py-10"
            >
                <h2
                    className="font-poppins text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight font-bold text-center md:text-left"
                    style={{
                        background: 'linear-gradient(87deg, #ECEEFF 17.24%, #B7B9E6 94.36%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Start building your gaming profile today
                </h2>
                <a
                    href="/create"
                    className="btn-primary text-lg font-poppins font-semibold whitespace-nowrap"
                >
                    Create Now
                </a>
            </div>
        </section>
    )
}

export default CTA
