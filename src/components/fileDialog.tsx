import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { downloadJsonObject } from "@/utils";
import { useKeyHistory } from "@/store";
import { useRef } from "react";
import {type KEY_HISTORY_STATE } from '@/store/keyHistory'


export default function FileDialog(props: {replaceHistory: (obj: KEY_HISTORY_STATE['history']) => void}) {
	const { replaceHistory } = props;
	const getKeyHistory = useKeyHistory((state) => state.get);
	const setName = useKeyHistory((state) => state.setName);
    const name = useKeyHistory(state => state.name)
	const uploadInputRef = useRef<HTMLInputElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null)

	function updateName(e: React.ChangeEvent<HTMLInputElement>) {
		setName(e.target.value);
	}

	function onUpload(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event?.target?.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e: ProgressEvent<FileReader>) => {
			const result = e?.target?.result as string
			try {
				const json = JSON.parse(result);
				if (json.name && json.history) {
					replaceHistory(json.history)
					setName(json.name)
					if (nameInputRef.current) {
	                    nameInputRef.current.value = json.name
					}
				}
			} catch (e) {
				console.log(e)
				// toast.error("Invalid JSON");
			}
			if (uploadInputRef.current) {
				uploadInputRef.current.value = '';
			}
		};
		reader.readAsText(file);
	}

	function doUpload() {
		uploadInputRef?.current?.click();
	}


	function doDownload() {
		const date = +new Date();
		const { name, history } = getKeyHistory();
		downloadJsonObject({ name, history }, `${name.trim()}_${date}`);
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="ghost" className="text-[23px] !px-2">
					<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M9 20H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H20a2 2 0 0 1 2 2v.5"></path><path d="M12 10v4h4"></path><path d="m12 14 1.535-1.605a5 5 0 0 1 8 1.5"></path><path d="M22 22v-4h-4"></path><path d="m22 18-1.535 1.605a5 5 0 0 1-8-1.5"></path></svg>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Config</DialogTitle>
					<DialogDescription>Upload a backup or download a backup</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col items-center gap-2">
					<div className="flex w-full">
						<Input
                            ref={nameInputRef}
							onChange={updateName}
                            value={name}
						/>
						<Input
							className="hidden"
							ref={uploadInputRef}
							onChange={onUpload}
							type="file"
							accept=".json"
						/>
					</div>
					<div className="flex w-full flex-row justify-start gap-2">
						<Button onClick={doUpload} className='flex-1'>
							Import
						</Button>
						<Button onClick={doDownload} className='flex-1'>
							Export
						</Button>
					</div>
				</div>
				<DialogFooter className="sm:justify-end">
					<DialogClose asChild>
						<Button type="button" variant="secondary">
							Close
						</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
