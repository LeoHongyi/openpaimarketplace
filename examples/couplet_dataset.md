# Couplet Dataset

This is the dataset of couplet. 

## Data content

This dataset contains processed data based on [Microsoft AI EDU project](https://github.com/microsoft/ai-edu/blob/master/B-%E5%AE%9E%E8%B7%B5%E6%A1%88%E4%BE%8B/B13-AI%E5%AF%B9%E8%81%94%E7%94%9F%E6%88%90%E6%A1%88%E4%BE%8B/docs/fairseq.md).

The original dataset was downloaded from [Public couplet dataset](https://github.com/wb14123/couplet-dataset) and was splited into ```test, train and valid``` with 98:1:1 proportion. The ```.up``` and ```.down``` files contains upper part and down part of a certain couplet seperately.

## The file stucture

```
.
|-- test.down // down part of couplet
|-- test.up  // up part of couplet
|-- train.down
|-- train.up
|-- valid.down
|-- valid.up
```

## How to use it

The data will be mounted at ```DATA_DIR``` environment variable. You could use ```$DATA_DIR``` in your command when submit jobs in pai.


