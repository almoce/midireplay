import { Button } from "@/components/ui/button";
import {
	Dialog,
	// DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";


export default function InfoDialog() {

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" className="text-[23px] !px-2">
					<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"></path><line x1="12" x2="12" y1="16" y2="12"></line><line x1="12" x2="12.01" y1="8" y2="8"></line></svg>
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Info</DialogTitle>
					<DialogDescription />
				</DialogHeader>
				<div className="flex flex-col items-left gap-2 text-[16px] sans leading-6">
					<video src="./preview.mp4" controls></video>
					<p>
						Hello, this application is primarily designed for recording from a MIDI input device and replaying by sending the notes through an output device. It also features the ability to save recorded MIDI note data as a backup in JSON format to a local file, which can be loaded again whenever needed. This app also leverages the localStorage caching feature, which means the last midi data is saved in your browser’s cache system and will remain available even after you close the browser.
					</p>
				</div>
				<div className="flex flex-col items-left gap-2 sans">
					<p className="text-sm text-black/30">
						Build with: Reat, Tailwind, Radix-ui, Tonejs, Zustand
						<br />
						<a href="https://wenceye.com">{new Date().getFullYear()} © wenceye.com</a>
					</p>
				</div>
				<DialogFooter className="sm:justify-start">
{/*					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>*/}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
