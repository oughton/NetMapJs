import json
import argparse
import re

parser = argparse.ArgumentParser(description='Process a host file into valid JSON')
parser.add_argument('hostf', type=file)
args = parser.parse_args()
#print args.hostf

fout = file('data.arbor', 'w')
defining = False
hosts = []
host = {}

for line in args.hostf:
	if line.startswith('}'):
		defining = False
		hosts.append(host)
	
	if defining:
		line = line.strip()
		parts = re.split(' |\t', line, 1)

		if len(parts) > 1:
			str = parts[1].strip()
			host[parts[0]] = str;

	if line.startswith('define host'):
		defining = True
		host = {}

for h in hosts:
    if 'host_name' in h and 'parents' in h:
	    fout.write(h['parents'] + ' -- ' + h['host_name'] + '\n')

#fout.write(json.dumps(hosts, sort_keys=True, indent=4))
fout.close()
args.hostf.close()
