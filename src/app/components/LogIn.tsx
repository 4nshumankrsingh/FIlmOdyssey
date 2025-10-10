'use client'

import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from 'next/link'
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/components/ui/form"
import { Separator } from "@/app/components/ui/separator"

// Fixed login schema - removed .default() from rememberMe
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean()
})

type FormData = z.infer<typeof loginSchema>

export default function LogIn() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [isHovered, setIsHovered] = useState({
    login: false,
    signup: false
  })
  const [isPressed, setIsPressed] = useState({
    login: false,
    signup: false
  })

  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    }
  })

  const watchedFields = form.watch()
  const isFormValid = watchedFields.email?.length > 0 && 
                     watchedFields.password?.length > 0

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setError("")

    try {
      const res = await signIn("credentials", {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe.toString(), // Convert to string
        redirect: false,
      })

      if (res?.error) {
        setError("Invalid email or password")
        toast.error("Login failed. Please check your credentials.")
        return
      }

      // Get the updated session after successful login
      const session = await getSession()
      
      if (session?.user?.username) {
        toast.success("Welcome back to FilmOdyssey!")
        router.push(`/user/${session.user.username}`)
        router.refresh() // Refresh to update the session state
      } else {
        // Fallback if username isn't available
        toast.success("Welcome back to FilmOdyssey!")
        router.push("/")
        router.refresh()
      }
    } catch (error: any) {
      console.log("Login failed", error)
      setError("An unexpected error occurred. Please try again.")
      toast.error("Login failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-yellow-400 tracking-wide hover:tracking-widest transition-all duration-300">
              {isSubmitting ? "Welcome Back..." : "Welcome to FilmOdyssey"}
            </CardTitle>
            <CardDescription className="text-gray-300 text-base hover:text-gray-200 transition-colors duration-300">
              Continue your cinematic journey and reconnect with fellow film enthusiasts
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message Display */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/50 text-red-200 text-sm py-3 px-4 rounded-lg text-center backdrop-blur-sm">
                {error}
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                          placeholder="Enter your password"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                {/* Remember Me Checkbox as FormField */}
                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex justify-between items-center text-sm">
                          <label className="flex items-center space-x-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-yellow-400/30 bg-black/50 text-yellow-400 focus:ring-yellow-400 hover:scale-110 transition-transform duration-200" 
                            />
                            <span className="text-gray-300 group-hover:text-gray-200 transition-colors duration-200">
                              Remember me
                            </span>
                          </label>
                          <Link 
                            href="/forgot-password" 
                            className="text-yellow-400 hover:text-yellow-300 transition-colors duration-200 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="w-full relative overflow-hidden group transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  onMouseEnter={() => handleHover('login')}
                  onMouseLeave={() => handleHoverExit('login')}
                  onMouseDown={() => handlePress('login')}
                  onMouseUp={() => handleRelease('login')}
                  onTouchStart={() => handlePress('login')}
                  onTouchEnd={() => handleRelease('login')}
                  style={{
                    background: isPressed.login 
                      ? 'linear-gradient(145deg, #F5C518, #D4A615)' 
                      : isHovered.login 
                      ? 'linear-gradient(145deg, #F5C518, #E6B917)'
                      : 'rgba(245, 197, 24, 0.15)',
                    color: (isHovered.login || isPressed.login) ? 'black' : '#F5C518',
                    border: '1px solid #F5C518',
                    transform: isPressed.login ? 'scale(0.98)' : isHovered.login ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isPressed.login 
                      ? '0 4px 8px rgba(245, 197, 24, 0.3)' 
                      : isHovered.login 
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
                        Signing In...
                      </span>
                    ) : (
                      <>
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
                      </>
                    )}
                  </span>
                </Button>
              </form>
            </Form>

            <Separator className="bg-yellow-400/30 hover:bg-yellow-400/50 transition-colors duration-300" />

            <div className="text-center">
              <p className="text-gray-300 mb-4 hover:text-gray-200 transition-colors duration-300">
                New to FilmOdyssey? Start your cinematic journey
              </p>
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="w-full relative overflow-hidden group transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  onMouseEnter={() => handleHover('signup')}
                  onMouseLeave={() => handleHoverExit('signup')}
                  onMouseDown={() => handlePress('signup')}
                  onMouseUp={() => handleRelease('signup')}
                  onTouchStart={() => handlePress('signup')}
                  onTouchEnd={() => handleRelease('signup')}
                  style={{
                    borderColor: isHovered.signup ? '#F5C518' : 'rgba(245, 197, 24, 0.5)',
                    background: isPressed.signup 
                      ? 'rgba(245, 197, 24, 0.2)'
                      : isHovered.signup 
                      ? 'rgba(245, 197, 24, 0.15)'
                      : 'transparent',
                    color: isHovered.signup ? '#F5C518' : 'rgba(245, 197, 24, 0.9)',
                    transform: isPressed.signup ? 'scale(0.98)' : isHovered.signup ? 'scale(1.02)' : 'scale(1)',
                    boxShadow: isPressed.signup 
                      ? '0 4px 8px rgba(245, 197, 24, 0.2)' 
                      : isHovered.signup 
                      ? '0 8px 20px rgba(245, 197, 24, 0.3)'
                      : '0 4px 12px rgba(245, 197, 24, 0.1)'
                  }}
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  
                  <span className="relative z-10 font-semibold flex items-center justify-center">
                    <span className="group-hover:scale-105 transition-transform duration-200">
                      Create New Account
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
                        d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                      />
                    </svg>
                  </span>
                </Button>
              </Link>
            </div>

            <div className="text-center text-xs text-gray-400 hover:text-gray-300 transition-colors duration-300">
              By signing in, you agree to our{" "}
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