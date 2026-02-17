"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth-client"
import { zodResolver } from "@hookform/resolvers/zod"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import z from "zod"

const loginSchema = z.object({
    email: z.email("Please enter a vaild email address"),
    password: z.string().min(1, "Password is required")
})

type LoginFormValues = z.infer<typeof loginSchema>

const LoginForm = () => {

    const router = useRouter()
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        }
    })

    const onSubmit = async (Values: LoginFormValues) => {
        await authClient.signIn.email({
            email: Values.email,
            password: Values.password,
            callbackURL: "/"
        }, {
            onSuccess: () => {
                console.log('pass');
                router.push('/')

            },
            onError: () => {

            },
        })
    }

    const isPending = form.formState.isSubmitting



    const signinWithGithub = async () => {
        await authClient.signIn.social({
            callbackURL: "/",
            provider: 'github'
        })
    }
    const signinWithGoogle = async () => {
        await authClient.signIn.social({
            callbackURL: "/",
            provider: 'google'
        })
    }

    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>
                        Welcome back
                    </CardTitle>
                    <CardDescription>
                        Login to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>


                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="grid gap-6">
                                <div className="flex flex-col gap-4">
                                    <Button
                                        variant={'outline'}
                                        className="w-full border rounded-md p-2 flex items-center justify-center gap-2 "
                                        onClick={signinWithGithub}
                                        type="button"

                                    >
                                        <Image src="/logos/github.svg" alt="github" width={20} height={20} />
                                        Continue with Github
                                    </Button>

                                    <Button
                                        variant={'outline'}
                                        className="w-full border rounded-md p-2 flex items-center justify-center gap-2"
                                        onClick={signinWithGoogle}
                                        type="button"
                                    >
                                        <Image src="/logos/google.svg" alt="google" width={20} height={20} />
                                        Continue with Google
                                    </Button>

                                    <div className="grid gap-6"
                                    >
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <Input className={'outline-none border p-1 rounded-md'} type="email" placeholder="m@example.com" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="password" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <Input className={'outline-none border p-1 rounded-md'} type="password" placeholder="********" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )} />
                                        <Button type="submit" className="w-full" disabled={isPending}>Login</Button>
                                    </div>
                                    <div className="text-center text-sm">
                                        Don&apos;t have an account?{" "}
                                        <Link href="/signup" className="underline">
                                            Sign Up
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Form>




                </CardContent>
            </Card>
        </div >
    )
}
export default LoginForm