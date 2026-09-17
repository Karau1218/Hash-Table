import json

class HashTable:
    def __init__(self):
        self.collection = {}

    def hash(self, string):
        return sum(ord(char) for char in string)

    def add(self, key, value):
        hashed_key = self.hash(key)
        if hashed_key not in self.collection:
            self.collection[hashed_key] = {}
        self.collection[hashed_key][key] = value
    def remove(self, key):
        hashed_key = self.hash(key)
        if hashed_key in self.collection and key in self.collection[hashed_key]:
            del self.collection[hashed_key][key]
            # Clean up empty bucket (optional, but keeps collection tidy)
            if not self.collection[hashed_key]:
                del self.collection[hashed_key]

    def lookup(self, key):
        hashed_key = self.hash(key)
        if hashed_key in self.collection and key in self.collection[hashed_key]:
            return self.collection[hashed_key][key]
        return None   

import json


class HashTable:
    def __init__(self):
        self.collection = {}

    def hash(self, string):
        return sum(ord(char) for char in string)

    def add(self, key, value):
        hashed_key = self.hash(key)
        if hashed_key not in self.collection:
            self.collection[hashed_key] = {}
        self.collection[hashed_key][key] = value

    def remove(self, key):
        hashed_key = self.hash(key)
        if hashed_key in self.collection and key in self.collection[hashed_key]:
            del self.collection[hashed_key][key]
            if not self.collection[hashed_key]:
                del self.collection[hashed_key]

    def lookup(self, key):
        hashed_key = self.hash(key)
        if hashed_key in self.collection and key in self.collection[hashed_key]:
            return self.collection[hashed_key][key]
        return None


# Global instance for Pyodide bridge
ht = HashTable()


def get_hash_breakdown(key):
    """Calculates hash and returns a character-level ASCII breakdown."""
    breakdown = [f"'{c}' ({ord(c)})" for c in key]
    total = sum(ord(c) for c in key)
    return {"formula": " + ".join(breakdown) if breakdown else "0", "hash": total}


def get_table_state_json():
    """Returns the internal buckets formatted for visualization."""
    return json.dumps(ht.collection)