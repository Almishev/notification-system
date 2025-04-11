import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/login' || path === '/signup' || path === '/verifyemail'

  const token = request.cookies.get('token')?.value || ''

  if (path === '/') {
    return NextResponse.next(); // Allow access to the home page for all users
  }

  if (path === '/posts') {
    return NextResponse.next(); // Allow access to '/posts' for all users
  }

  if(isPublicPath && token) {
    return NextResponse.redirect(new URL('/', request.nextUrl))
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/', request.nextUrl)); // Redirect unauthenticated users to the home page
  }
    
}

 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/', // Allow unauthenticated access to the home page
    '/posts', // Allow unauthenticated access to the blog page
    '/profile',
    '/login',
    '/signup',
    '/verifyemail'
  ]
};