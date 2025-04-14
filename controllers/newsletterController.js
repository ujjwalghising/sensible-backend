// controllers/newsletterController.js
import NewsletterSubscriber from '../models/NewsLetterSubscriber.js';

export const subscribeToNewsletter = async (req, res) => {
  const { email } = req.body;

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  try {
    const existing = await NewsletterSubscriber.findOne({ email });

    if (existing) {
      return res.status(200).json({ message: 'You are already subscribed!' });
    }

    await NewsletterSubscriber.create({ email });

    return res.status(201).json({ message: 'Thanks for subscribing! 🎉' });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    return res.status(500).json({ message: 'Something went wrong. Try again later.' });
  }
};
