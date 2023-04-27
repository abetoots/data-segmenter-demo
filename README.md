# Data Segmenter Demo

Demonstrates how to use [`@satoshibits/data-segmenter`](https://www.npmjs.com/package/@satoshibits/data-segmenter) to create segments from your data regardless of any data source or shape. Use case: Useful when you want to send marketing campaigns to certain segments of your data.

You first define your segments (data that meet a criteria) in the backend using the SegmentBuilder API.

You can then compose your segments from the SegmentBuilder API in the frontend using the SegmentComposer API.

You can then parse and resolve the composed segments from the SegmentComposerAPI using the QueryComposer API.
