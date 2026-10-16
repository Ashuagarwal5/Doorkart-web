import type { MetadataRoute } from 'next';
export default function manifest(): MetadataRoute.Manifest {
  return { name: 'DoorKart', short_name: 'DoorKart', description: 'Thoughtful finds for your everyday.', start_url: '/', display: 'standalone', background_color: '#fcfbf7', theme_color: '#fcfbf7', icons: [{ src: '/assets/favicon-64.png', sizes: '64x64', type: 'image/png' }] };
}
