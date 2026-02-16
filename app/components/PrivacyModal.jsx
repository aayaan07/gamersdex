
import React from 'react';
import Modal from './Modal';

const PrivacyModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Privacy Policy">
            <div className="space-y-6">
                <div>
                    <h3 className="text-white font-semibold text-lg mb-2">Effective Date: 15/02/2026</h3>
                    <p>GamersDex respects your privacy. This Privacy Policy explains what information we collect and how we use it.</p>
                </div>

                <section>
                    <h4 className="text-white font-semibold mb-2">1. Information We Collect</h4>
                    <p className="mb-2">We only collect information necessary to provide the platform:</p>
                    <div className="mb-2">
                        <strong className="text-white/90">Account Information</strong>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                            <li>Email address</li>
                            <li>Username or display name</li>
                        </ul>
                    </div>
                    <div className="mb-2">
                        <strong className="text-white/90">Profile Information</strong>
                        <ul className="list-disc pl-5 space-y-1 mt-1">
                            <li>Bio</li>
                            <li>Game lists (played, playing, wishlist, dropped)</li>
                            <li>Ratings</li>
                            <li>Aura and rank data</li>
                        </ul>
                    </div>
                    <p>We do not collect device information, browsing history, or usage analytics.</p>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">2. How We Use Your Information</h4>
                    <p className="mb-2">We use your information only to:</p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>Create and manage your account</li>
                        <li>Display your public profile</li>
                        <li>Operate ranking and Aura systems</li>
                        <li>Maintain platform functionality</li>
                    </ul>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">3. Third-Party Services</h4>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>GamersDex may use trusted services for hosting and authentication (such as Firebase). These providers may process data securely on our behalf.</li>
                        <li>Game data may be sourced from third-party APIs (such as RAWG).</li>
                    </ul>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">4. Data Security</h4>
                    <p>We take reasonable measures to protect your account and stored data.</p>
                </section>


                <section>
                    <h4 className="text-white font-semibold mb-2">5. Children’s Privacy</h4>
                    <p>GamersDex is not intended for users under the age of 13.</p>
                </section>

                <section>
                    <h4 className="text-white font-semibold mb-2">6. Changes to This Policy</h4>
                    <p>We may update this Privacy Policy from time to time. Updates will be posted on this page.</p>
                </section>
            </div>
        </Modal>
    );
};

export default PrivacyModal;
