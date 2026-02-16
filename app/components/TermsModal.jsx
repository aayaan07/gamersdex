
import React from 'react';
import Modal from './Modal';

const TermsModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Terms of Service">
            <div className="space-y-6">
                <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Effective Date: 15/02/2026</h3>
                    <p>Website: GamersDex</p>
                </div>

                <section>
                    <h4 className="text-white font-semibold mb-2">1. Acceptance of Terms</h4>
                    <p>By accessing or using GamersDex ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform.</p>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">2. Eligibility</h4>
                    <p>You must be at least 13 years old (or the minimum age required in your country) to use GamersDex. By using the Platform, you confirm that you meet this requirement.</p>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">3. User Accounts</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>You are responsible for maintaining the security of your account.</li>
                        <li>You agree to provide accurate information.</li>
                        <li>You are responsible for all activity under your account.</li>
                        <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
                    </ul>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">4. User Content</h4>
                    <p className="mb-2">GamersDex allows users to create profiles, track games, post ratings, and receive Aura.
                        By posting content, you:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Confirm you own or have permission to use the content.</li>
                        <li>Grant GamersDex a non-exclusive, worldwide license to display and distribute your content within the Platform.</li>
                        <li>Agree not to post unlawful, abusive, harmful, or misleading content.</li>
                        <li>We reserve the right to remove content that violates our guidelines.</li>
                    </ul>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">5. Aura & Platform Features</h4>
                    <p>Aura and ranking systems are part of GamersDex's internal engagement mechanics. We reserve the right to modify, reset, or remove Aura systems at any time to maintain fairness and platform integrity.</p>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">6. Intellectual Property</h4>
                    <p>All platform design, branding, logos, and features are the property of GamersDex.
                        Game data provided via third-party APIs (such as RAWG) remains the property of their respective owners.</p>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">7. Prohibited Conduct</h4>
                    <p className="mb-2">You agree not to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Attempt to exploit, hack, or disrupt the Platform</li>
                        <li>Use bots or automated systems to manipulate rankings or Aura</li>
                        <li>Impersonate others</li>
                        <li>Violate applicable laws</li>
                    </ul>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">8. Termination</h4>
                    <p>We may suspend or terminate access to the Platform at any time if users violate these terms.</p>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">9. Disclaimer</h4>
                    <p>GamersDex is provided "as is." We do not guarantee uninterrupted or error-free service.</p>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">10. Limitation of Liability</h4>
                    <p>GamersDex shall not be liable for indirect, incidental, or consequential damages arising from use of the Platform.</p>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">11. Changes to Terms</h4>
                    <p>We may update these Terms from time to time. Continued use of the Platform means you accept the updated Terms.</p>
                </section>
            </div>
        </Modal>
    );
};

export default TermsModal;
