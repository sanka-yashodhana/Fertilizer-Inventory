'use client';

import { SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs';

export default function AuthControls() {
  return (
    <div className="flex items-center gap-4">
      <Show when="signed-out">
        <SignInButton />
        <SignUpButton />
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
