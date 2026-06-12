/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.ejs', './public/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        'ck-black':      '#0D0B08',
        'ck-dark':       '#F5F2EB',
        'ck-card':       '#FFFFFF',
        'ck-card-hover': '#F9F7F2',
        'ck-yellow':     '#F4B400',
        'ck-gold':       '#C9A84C',
        'ck-gold-btn':   '#D4A94E',
        'ck-cream':      '#1A1510',
        'ck-muted':      '#6B6560',
        'ck-border':     '#E5E0D8',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      fontSize: {
        'h1': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'h2': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'h3': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'h4': ['18px', { lineHeight: '28px', fontWeight: '500' }],
        'body': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'sm-label': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      boxShadow: {
        'warm':    '0 4px 24px rgba(0,0,0,0.08)',
        'warm-lg': '0 8px 48px rgba(0,0,0,0.12)',
        'glow-yellow': '0 0 20px rgba(244,180,0,0.4)',
        'glow-gold':   '0 0 16px rgba(201,168,76,0.3)',
      },
      backgroundImage: {
        'warm-vignette': 'radial-gradient(ellipse at center, transparent 30%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
};
