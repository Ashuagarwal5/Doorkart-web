import Legal from '../legal';
import { CONTACT } from '@/lib/contact';
export const metadata = { title: 'Contact Us' };
export default function Contact() {
  return <Legal title="Contact Us"><p>We’d love to hear from you. Reach out for orders, questions or anything you need help with.</p><h2>Email</h2><p><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></p><h2>Phone</h2><p><a href={`tel:+91${CONTACT.phone}`}>+91 {CONTACT.phone}</a></p><h2>Address</h2><p>{CONTACT.address}</p></Legal>;
}
