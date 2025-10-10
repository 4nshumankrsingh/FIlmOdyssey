'use client'

import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Separator } from "@/app/components/ui/separator"

// Updated signup schema with username - changed from 6 to 4 characters
const signUpSchema = z.object({
  username: z.string()
    .min(4, "Username must be at least 4 characters")
    .max(15, "Username must be no more than 15 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

type FormData = z.infer<typeof signUpSchema>

export default function SignUp() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isHovered, setIsHovered] = useState({
    signup: false,
    login: false
  })
  const [isPressed, setIsPressed] = useState({
    signup: false,
    login: false
  })

  const form = useForm<FormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  })

  const watchedFields = form.watch()
  const isFormValid = watchedFields.username?.length > 0 && 
                     watchedFields.email?.length > 0 && 
                     watchedFields.password?.length > 0

  const checkUserExists = async (email: string, username: string) => {
    try {
      const response = await fetch('/api/auth/userExists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username }),
      });

      if (!response.ok) {
        throw new Error('Failed to check user existence');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return { exists: false, user: null };
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setError("");

    try {
      // First check if user already exists
      const userCheck = await checkUserExists(data.email, data.username);
      
      if (userCheck.exists) {
        if (userCheck.user?.email === data.email) {
          setError("An account with this email already exists.");
          toast.error("An account with this email already exists.");
          return;
        }
        if (userCheck.user?.username === data.username) {
          setError("This username is already taken.");
          toast.error("This username is already taken.");
          return;
        }
      }

      // Proceed with registration
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.status === 201) {
        toast.success("Account created successfully!");
        router.push("/login");
      } else {
        setError(result.message || "Signup failed.");
        toast.error(result.message || "Signup failed.");
      }
    } catch (error: any) {
      console.error("Signup failed", error);
      const errorMessage = error.message || "Signup failed. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHover = (button: string) => {
    setIsHovered(prev => ({ ...prev, [button]: true }))
  }

  const handleHoverExit = (button: string) => {
    setIsHovered(prev => ({ ...prev, [button]: false }))
  }

  const handlePress = (button: string) => {
    setIsPressed(prev => ({ ...prev, [button]: true }))
  }

  const handleRelease = (button: string) => {
    setIsPressed(prev => ({ ...prev, [button]: false }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative text-white font-sans overflow-hidden bg-black">
      {/* Yellow dimming light background */}
      <div className="absolute inset-0 bg-yellow-400/5 z-0" />
      
      {/* Subtle yellow glow effects */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl opacity-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-yellow-400 rounded-full filter blur-3xl opacity-10 animate-pulse" />

      {/* Main Content */}
      <div className="w-full max-w-md p-4 relative z-10">
        <Card className="border-yellow-400/30 bg-black/70 backdrop-blur-sm shadow-2xl hover:shadow-yellow-400/20 transition-all duration-500">
          <CardHeader className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400/10 mx-auto mb-2 hover:bg-yellow-400/20 transition-all duration-300 hover:scale-110">
              <svg className="w-8 h-8 text-yellow-400 hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-yellow-400 tracking-wide hover:tracking-widest transition-all duration-300">
              {isSubmitting ? "Creating Your Account..." : "Join FilmOdyssey"}
            </CardTitle>
            <CardDescription className="text-gray-300 text-base hover:text-gray-200 transition-colors duration-300">
              Start your cinematic journey and connect with fellow film enthusiasts
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-200 text-sm py-3 px-4 rounded-lg text-center backdrop-blur-sm animate-pulse">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {error}
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-400/90 font-medium hover:text-yellow-300 transition-colors duration-200">
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="text"
                          className="border-yellow-400/30 bg-black/50 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300"
                          placeholder="Choose a username (4-15 characters)"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-400/90 font-medium hover:text-yellow-300 transition-colors duration-200">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="email"
                          className="border-yellow-400/30 bg-black/50 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300"
                          placeholder="Enter your email address"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-yellow-400/90 font-medium hover:text-yellow-300 transition-colors duration-200">
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="password"
                          className="border-yellow-400/30 bg-black/50 text-white placeholder-gray-400 focus:border-yellow-400 focus:ring-yellow-400/20 hover:border-yellow-400/50 transition-all duration-300"
                          placeholder="Create a strong password (min. 6 characters)"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center space-x-2 text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="rounded border-yellow-400/30 bg-black/50 text-yellow-400 focus:ring-yellow-400 hover:scale-110 transition-transform duration-200" 
                      required
                    />
                    <span className="text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                      I agree to the terms and conditions
                    </span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full relative overflow-hidden group transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  onMouseEnter={() => handleHover('signup')}
                  onMouseLeave={() => handleHoverExit('signup')}
                  onMouseDown={() => handlePress('signup')}
                  onMouseUp={() => handleRelease('signup')}
                  onTouchStart={() => handlePress('signup')}
                  onTouchEnd={() => handleRelease('signup')}
                  style={{
                    background: isPressed.signup 
                      ? 'linear-gradient(145deg, #F5C518, #D4A615)' 
                      : isHovered.signup 
                      ? 'linear-gradient(145deg, #F5C518, #E6B917)'
                      : 'rgba(245, 197, 24, 0.15)',
                    color: (isHovered.signup || isPressed.signup) ? 'black' : '#F5C518',
                    border: '1px solid #F5C518',
                    transform: isPressed.signup ? 'scale(0.98)' : isHovered.signup ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isPressed.signup 
                      ? '0 4px 8px rgba(245, 197, 24, 0.3)' 
                      : isHovered.signup 
                      ? '0 8px 25px rgba(245, 197, 24, 0.4)'
                      : '0 4px 15px rgba(245, 197, 24, 0.2)'
                  }}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <span className="relative z-10 font-semibold transition-all duration-300 flex items-center justify-center">
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg 
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Creating Account...
                      </span>
                    ) : (
                      <>
                        <span className="group-hover:scale-105 transition-transform duration-200">
                          Create Account
                        </span>
                        <svg 
                          className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </>
                    )}
                  </span>
                </Button>
              </form>
            </Form>

            <Separator className="bg-yellow-400/30 hover:bg-yellow-400/50 transition-colors duration-300" />

            <div className="text-center">
              <p className="text-gray-300 mb-4 hover:text-gray-200 transition-colors duration-300">
                Already have an account? Continue your cinematic journey
              </p>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full relative overflow-hidden group transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  onMouseEnter={() => handleHover('login')}
                  onMouseLeave={() => handleHoverExit('login')}
                  onMouseDown={() => handlePress('login')}
                  onMouseUp={() => handleRelease('login')}
                  onTouchStart={() => handlePress('login')}
                  onTouchEnd={() => handleRelease('login')}
                  style={{
                    borderColor: isHovered.login ? '#F5C518' : 'rgba(245, 197, 24, 0.5)',
                    background: isPressed.login 
                      ? 'rgba(245, 197, 24, 0.2)'
                      : isHovered.login 
                      ? 'rgba(245, 197, 24, 0.15)'
                      : 'transparent',
                    color: isHovered.login ? '#F5C518' : 'rgba(245, 197, 24, 0.9)',
                    transform: isPressed.login ? 'scale(0.98)' : isHovered.login ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isPressed.login 
                      ? '0 4px 8px rgba(245, 197, 24, 0.2)' 
                      : isHovered.login 
                      ? '0 8px 20px rgba(245, 197, 24, 0.3)'
                      : '0 4px 12px rgba(245, 197, 24, 0.1)'
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <span className="relative z-10 font-semibold flex items-center justify-center">
                    <span className="group-hover:scale-105 transition-transform duration-200">
                      Sign In to Your Account
                    </span>
                    <svg 
                      className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      />
                    </svg>
                  </span>
                </Button>
              </Link>
            </div>

            <div className="text-center text-xs text-gray-400 hover:text-gray-300 transition-colors duration-300">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-yellow-400 hover:text-yellow-300 transition-all duration-300 hover:underline hover:underline-offset-2">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-yellow-400 hover:text-yellow-300 transition-all duration-300 hover:underline hover:underline-offset-2">
                Privacy Policy
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}