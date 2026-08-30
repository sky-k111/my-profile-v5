import { gsap } from 'gsap';
import './style.css';

const stage = document.querySelector('.photo-roll-demo');
const photo = document.querySelector('.photo-roll-demo__photo');
const flatPhoto = document.querySelector('.photo-roll-demo__flat');
const slices = gsap.utils.toArray('.photo-roll-demo__slice');
const edge = document.querySelector('.photo-roll-demo__edge');

if (stage && photo && flatPhoto && edge) {
  const media = gsap.matchMedia();

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

    timeline
      .set(stage, { autoAlpha: 1 })
      .set(photo, { transformOrigin: '50% 100%', transformPerspective: 1400 })
      .set(flatPhoto, { autoAlpha: 0 })
      .set(slices, { transformOrigin: '50% 100%', transformPerspective: 1400 })
      .fromTo(
        photo,
        { autoAlpha: 0, y: '42vh', rotationX: 48, rotation: -2, skewX: -4, scaleX: 0.92, scaleY: 0.12 },
        { autoAlpha: 1, y: 0, rotationX: 0, rotation: 0, skewX: 0, scaleX: 1, scaleY: 1, duration: 1.45 },
      )
      .fromTo(
        slices,
        {
          x: (index) => (index % 2 === 0 ? -1 : 1) * (34 - index * 2),
          y: (index) => `${(7 - index) * 5}vh`,
          z: (index) => (7 - index) * 28,
          rotationX: 62,
          skewX: (index) => (index % 2 === 0 ? 1 : -1) * (12 - index),
          scaleX: (index) => 1.32 - index * 0.035,
          scaleY: 0.36,
        },
        { x: 0, y: 0, z: 0, rotationX: 0, skewX: 0, scaleX: 1, scaleY: 1, duration: 0.84, stagger: { each: 0.08, from: 'end' } },
        0.24,
      )
      .fromTo(
        edge,
        { autoAlpha: 0.92, scaleX: 0.2 },
        { autoAlpha: 0, scaleX: 1, duration: 0.35, ease: 'power1.out' },
        '-=0.2',
      )
      .set(slices, { autoAlpha: 0 })
      .set(flatPhoto, { autoAlpha: 1 });
  });

  media.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set([stage, photo, flatPhoto], { autoAlpha: 1, x: 0, y: 0, z: 0, rotationX: 0, rotation: 0, skewX: 0, scaleX: 1, scaleY: 1 });
    gsap.set(slices, { autoAlpha: 0 });
    gsap.set(edge, { autoAlpha: 0 });
  });
}
