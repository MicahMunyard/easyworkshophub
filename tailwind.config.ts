
import type { Config } from "tailwindcss";

export default {
	darkMode: "class",
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				workshop: {
					blue: '#0A84FF',
					darkBlue: '#0077E6',
					gray: '#8E8E93',
					darkGray: '#636366',
					lightGray: '#F2F2F7',
					black: '#1D1D1F',
                    red: '#ea384c',
                    orange: '#F97316',
                    carbon: '#222222',
                    silver: '#C8C8C9',
                    // New colors for the refreshed UI
                    slate: '#3C4048',
                    charcoal: '#2D3436',
                    mint: '#00B894',
                    success: '#00C853',
                    warning: '#FFB74D',
                    info: '#29B6F6',
                    error: '#F44336'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' }
				},
				slideUp: {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' }
				},
				slideRight: {
					from: { transform: 'translateX(-10px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' }
				},
                pulse: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' }
                },
                revEngine: {
                    '0%': { transform: 'translateX(0)' },
                    '10%': { transform: 'translateX(-1px)' },
                    '20%': { transform: 'translateX(1px)' },
                    '30%': { transform: 'translateX(-1px)' },
                    '40%': { transform: 'translateX(1px)' },
                    '50%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(0)' }
                },
                floatUp: {
                    '0%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                    '100%': { transform: 'translateY(0)' }
                },
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-1deg)' },
                    '50%': { transform: 'rotate(1deg)' }
                }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				fadeIn: 'fadeIn 0.5s ease-out',
				slideUp: 'slideUp 0.5s ease-out',
				slideRight: 'slideRight 0.5s ease-out',
                pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                revEngine: 'revEngine 0.5s ease-in-out',
                floatUp: 'floatUp 3s ease-in-out infinite',
                wiggle: 'wiggle 1s ease-in-out infinite'
			},
            backgroundImage: {
                'gradient-card': 'linear-gradient(109.6deg, rgba(223,234,247,1) 11.2%, rgba(244,248,252,1) 91.1%)',
                'gradient-sidebar': 'linear-gradient(180deg, rgba(29,29,31,1) 0%, rgba(44,44,46,1) 100%)',
                'gradient-primary': 'linear-gradient(90deg, rgba(234,56,76,1) 0%, rgba(249,115,22,1) 100%)'
            }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
