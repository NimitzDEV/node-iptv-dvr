# NODE-IPTV-DVR

This node program is use for recording HLS live stream using ffmpeg

## Requirements

Node (at least v7.6.0)

FFMpeg installed and exported to PATH variable

## Usage

- Launch program

  `node index.js`

- If you are the first time to use, make sure to set m3u list address first by typing `setaddr http://yourm3u file`

- after that download the m3u file by typing `updatem3u`

- then use command `recorder -l` to list all available channels

- For example you want to record channel 2701 CBS KYW3 HD, then type `recorder -d 2701`

- Using `state ` to check the recording status

- Using `stop <Task>` to stop recording, if <Task> is not provide, this will stop all current recorders. Task can be provided only a few leading chars to match exact full TaskID automatically.

## Other usage

- `updatem3u` will only download the new m3u file, if you want to see the new channel list within current instance, use `recorder -l -r` to reload.
- Using `help` to see all commands

## Known issues

- Tested with Xshell (Build 1339), remote server with CentOS 6.2, the shell interface stop receiving inputs after first command interaction, but the program is still running. The cause of this issue is currently unknown.

