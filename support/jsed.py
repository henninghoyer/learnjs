#!/usr/bin/env python

import json,sys

json_file = open(sys.argv[1], "r+")
doc = json.load(json_file)

keys = sys.argv[2].split('.')

def search(doc, keys):
    if len(keys) == 1:
        return doc[keys[0]]
    else:
        return search(doc[keys[0]], keys[1:])

print(search(doc, keys))

