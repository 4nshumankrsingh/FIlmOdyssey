'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col relative text-white font-sans overflow-hidden bg-black pt-16">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed z-0"
        style={{ backgroundImage: "url('/oppy.jpg')" }}
      ></div>
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* Subtle yellow glow effects */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400 rounded-full filter blur-3xl opacity-5 animate-pulse"></div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-4 md:p-8 relative z-10">
        {/* Hero Section */}
        <div className="w-full max-w-6xl mx-auto text-center mb-12">
          <Card className="p-6 md:p-8 rounded-2xl border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-3xl md:text-5xl font-bold text-yellow-400">
                About FilmOdyssey
              </CardTitle>
              <CardDescription className="text-xl text-gray-200 max-w-4xl mx-auto">
                Your cinematic journey begins here. Discover, track, and share your passion for films with a global community of movie lovers.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="mt-6">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/signup">
                  <Button className="bg-yellow-400 text-black font-bold py-3 px-6 rounded-full transition-all duration-300 hover:bg-yellow-500 hover:scale-105">
                    Join FilmOdyssey
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 font-bold py-3 px-6 rounded-full transition-all duration-300 hover:bg-yellow-400/10">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Sections */}
        <div className="w-full max-w-6xl mx-auto space-y-8">
          {/* What is FilmOdyssey Section */}
          <Card className="rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                What is FilmOdyssey?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 text-lg leading-relaxed">
                FilmOdyssey is a global social network for film enthusiasts to discuss and discover movies. Use it as a diary to record and share your opinions about films as you watch them, or to keep track of films you've seen in the past. Highlight your favorite movies on your profile page. Rate, review, and tag films as you add them. Connect with friends to see what they're watching, maintain a watchlist of films you'd like to see, and create lists or collections on any topic. It's your personal hub for all things cinema.
              </p>
            </CardContent>
          </Card>

          {/* Why FilmOdyssey Section */}
          <Card className="rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  </svg>
                </div>
                Why FilmOdyssey?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-200 text-lg leading-relaxed">
                The name FilmOdyssey reflects our passion for the cinematic journey, inspired by the epic voyages of storytelling through film. It celebrates the widescreen experience and the adventure of discovering new movies, with no connection to orienteering or other unrelated references.
              </p>
            </CardContent>
          </Card>

          {/* Using FilmOdyssey Section */}
          <Card className="rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                Using FilmOdyssey
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">How should I use FilmOdyssey?</h3>
                  <p className="text-gray-200">
                    Use FilmOdyssey however suits you best. The simplest way to start is by marking films you've seen using the 'eye' icon on each movie poster. You can also rate films and access other features through the Actions menu on the poster. Each film you mark as watched is added to your profile, letting others see your viewing history and allowing the site to optionally hide films you've seen when browsing certain pages.
                    <br/><br/>
                    Log a film to your Diary, including the date you watched it and an optional review. You can do this as you watch films or to share thoughts on movies you've seen in the past (specifying a watched date is optional). When logging or reviewing a film, you can rate and/or like it. FilmOdyssey also offers tools for creating and sharing lists or collections of films.
                  </p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">What's the difference between marking a film watched and logging it?</h3>
                  <p className="text-gray-200">
                    Marking a film as 'watched' (using the 'eye' icon on the film's poster or by rating it if not already marked) indicates you've seen the film at some point. It's ideal for quickly adding films to your history without recalling exact dates. Marking films as watched contributes to your total film count, helps track your progress on lists (showing the percentage of each list you've watched), and allows you to hide seen films on some pages.
                    <br/><br/>
                    Logging a film records a specific viewing date, building your Diary (a timeline of when you watched each film) and the Recent Activity section of your profile. Films logged are also marked as watched if not already set.
                  </p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Can I remove a film from my watched list?</h3>
                  <p className="text-gray-200">Yes, you can unmark a film as watched by clicking the green "eye" icon to toggle it off. However, you'll need to delete any related diary entries, reviews, or ratings for the film, which can be done on the film's page.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">What's the difference between liking and rating a film?</h3>
                  <p className="text-gray-200">Liking a film shows you enjoyed it and adds it to your Profile and Likes pages. Rating a film (via the film's page, logging it, or the Actions menu on a poster) gives a more specific indication of how much you loved or disliked it. Ratings appear on your Ratings page and in your friends' activity feeds if part of a review or diary entry.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Can I log a film and review it later?</h3>
                  <p className="text-gray-200">Yes. Visit the film's detail page and use the review box to log the film, then return later to add a review.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">When I rate a film, do all my ratings for it change?</h3>
                  <p className="text-gray-200">No. Ratings tied to previous diary entries or reviews remain unchanged, allowing your opinion to evolve over time. Each new rating added through a diary entry, review, or update sets the 'default' rating for the film.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Why does my films total differ from my diary entries total?</h3>
                  <p className="text-gray-200">Your 'Films' total counts each film once for a given period (all time or a single year), while 'Diary Entries' counts every individual viewing. If you've logged a film multiple times in the period, your Diary Entries total will be higher than your Films total. Note that rewatches count toward your Films total for the year only on the first viewing of that year.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Can I watch films on FilmOdyssey?</h3>
                  <p className="text-gray-200">No, we are not a streaming service, but we provide links to films available on other platforms.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Membership Section */}
          <Card className="rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                Membership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Do I need to create an account to use FilmOdyssey?</h3>
                  <p className="text-gray-200">No. You can freely browse FilmOdyssey without an account, but you'll need to create one to log films, write reviews, or engage with the community.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">How do I become a member?</h3>
                  <p className="text-gray-200">Simply create an account—no invitation from another member is required.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Does it cost to use FilmOdyssey?</h3>
                  <p className="text-gray-200">No. FilmOdyssey is completely free to use.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Will I be paid for my reviews?</h3>
                  <p className="text-gray-200">No. We do not offer payment for reviews.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile and Settings Section */}
          <Card className="rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                Profile and Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">How do I validate my email address?</h3>
                  <p className="text-gray-200">You don't need a valid email address to sign up; any email account will work.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Does FilmOdyssey have two-factor authentication for increased account security?</h3>
                  <p className="text-gray-200">No, two-factor authentication is not currently available.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">How do I add an avatar image to my account?</h3>
                  <p className="text-gray-200">You can add an avatar through the settings page, accessible via the Navbar or your profile page.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Can I change my username?</h3>
                  <p className="text-gray-200">No, usernames cannot be changed once set.</p>
                </div>

                <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                  <h3 className="text-xl font-semibold text-yellow-400 mb-3">Someone else has registered a username I have a trademark for. Can I have it?</h3>
                  <p className="text-gray-200">Not necessarily. Usernames are assigned on a first-come, first-served basis across all global territories. While you can submit proof of your trademark, using a trademarked name as a username doesn't always constitute infringement, and we are not equipped to mediate complex trademark disputes.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations Section */}
          <Card className="rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                </div>
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">Can FilmOdyssey generate recommendations for me?</h3>
                <p className="text-gray-200">Yes, you can use the FilmOdyssey AI Assistant to request personalized film recommendations based on your tastes.</p>
              </div>
            </CardContent>
          </Card>

          {/* Community and Communication Section */}
          <Card className="rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path>
                  </svg>
                </div>
                Community and Communication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">If there is no Following feature, does that mean we can't communicate with other users?</h3>
                <p className="text-gray-200">Not at all. You can send messages to other users by clicking the Send Message icon on their profile page.</p>
              </div>
            </CardContent>
          </Card>

          {/* Future Features Section */}
          <Card className="rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                Future Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">Are there more features we can expect in the future?</h3>
                <p className="text-gray-200">Yes, we plan to introduce a feature allowing users to follow others on FilmOdyssey.</p>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details Section */}
          <Card className="rounded-xl border-yellow-400/20 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                  </svg>
                </div>
                Technical Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/30 rounded-lg p-6 border border-yellow-400/10">
                <h3 className="text-xl font-semibold text-yellow-400 mb-3">Which API was used to build FilmOdyssey?</h3>
                <p className="text-gray-200">We used the TMDB API to develop this website.</p>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <Card className="rounded-xl border-yellow-400/30 bg-yellow-400/10 backdrop-blur-sm text-center">
            <CardContent className="p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 mb-4">
                Ready to Start Your Cinematic Journey?
              </h2>
              <p className="text-gray-200 text-lg mb-6 max-w-2xl mx-auto">
                Join thousands of film lovers who are already tracking their movies, sharing reviews, and discovering new favorites on FilmOdyssey.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/signup">
                  <Button className="bg-yellow-400 text-black font-bold py-3 px-8 rounded-full transition-all duration-300 hover:bg-yellow-500 hover:scale-105">
                    Create Your Account
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 font-bold py-3 px-8 rounded-full transition-all duration-300 hover:bg-yellow-400/10">
                    Explore Films
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 md:py-8 text-sm text-gray-400 bg-black/60 backdrop-blur-sm relative z-10 border-t border-yellow-400/20 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <p>© 2025 FilmOdyssey. All rights reserved.</p>
          <p className="mt-2 text-xs">Built with passion for cinema lovers everywhere.</p>
        </div>
      </footer>
    </div>
  )
}