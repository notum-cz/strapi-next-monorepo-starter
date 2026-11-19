"""Print which pages use which page-builder component, with the section index.

Usage: python3 -I component-usage.py <strapi-base-url>
Output: one line per component, "<uid> [(fullPath, index), ...]".
"""
import json
import sys
import urllib.parse
import urllib.request
from collections import defaultdict


def main() -> None:
    base = sys.argv[1].rstrip("/")
    query = urllib.parse.urlencode(
        {"fields[0]": "fullPath", "populate[0]": "content", "pagination[pageSize]": "100"}
    )
    with urllib.request.urlopen(f"{base}/api/pages?{query}", timeout=60) as res:
        data = json.load(res)["data"]

    usage = defaultdict(list)
    for page in data:
        for index, section in enumerate(page.get("content") or []):
            usage[section["__component"]].append((page["fullPath"], index))

    for uid in sorted(usage):
        print(uid, usage[uid])


if __name__ == "__main__":
    main()
