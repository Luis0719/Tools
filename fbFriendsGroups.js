const friendsContainerClasses = 'bp9cbjyn ue3kfks5 pw54ja7n uo3d90p7 l82x9zwi n1f8r23x rq0escxv j83agx80 bi6gxh9e discj3wi hv4rvrfc ihqw7lf3 dati1w0a gfomwglr';
const parentContainerClasses = 'j83agx80 btwxx1t3 lhclo0ds i1fnvgqd';
const friendNameContainerClasses = 'd2edcug0 hpfvmrgz qv66sw1b c1et5uql oi732d6d ik7dh3pa ht8s03o8 a8c37x1j keod5gw0 nxhoafnm aigsh9s9 d9wwppkn fe6kdd0r mau55g9w c8b282yb iv3no6db a5q79mjw g1cxx5fr lrazzd5p oo9gr5id';
// const blockList = ['Z', 'Y', 'S', 'T', 'U', 'V', 'W', 'X'];
const blockList = [];

const loadAllFriends = () => new Promise((resolve) => {
  let prevPos = window.pageYOffset;
  let retries = 0;

  let interval = setInterval(() => {
    window.scrollTo(0,document.body.scrollHeight);
    const newPos = window.pageYOffset;

    if (prevPos === newPos) {
      if (retries > 8) {
        clearInterval(interval);
        return resolve();
      }

      retries++;
      return;
    }

    retries = 0;
    prevPos = newPos;
  }, 200);
})

const addCssClasses = () => {
  const styles = document.createElement('style');
  styles.type = 'text/css';
  styles.innerHTML = `.collapsible { display: inline-block; border: 1px solid var(--primary-text); overflow-y: hidden; width: 100%;}`;
  styles.innerHTML += `.collapsible h2 { color: var(--primary-text); margin: 10px 0px 10px 10px; font-size: 32px;}`;
  styles.innerHTML += '.collapsible.collapse .container { height: 0px; }';
  document.getElementsByTagName('head')[0].appendChild(styles);
}

const getFriendName = (elem => elem.getElementsByClassName(friendNameContainerClasses)[0]?.innerText || '');
const parameterizeFirstLetter = (letter) => letter.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Replace especial characters with its normal mode. E.g. á = a

const groupFriendsByFirstLetter = (friends) => friends.reduce((result, friend) => {
  const friendName = getFriendName(friend);

  // Facebook uses a div with the same classes for friend's fields that are still loading
  // We know we've found one because it won't contain a name
  // This is just a way of filtering them
  if(!friendName) return result;

  const firstNameLetter = parameterizeFirstLetter(friendName[0] || '');
  if(blockList.includes(firstNameLetter)) return result;


  result[firstNameLetter]
    ? result[firstNameLetter].push(friend)
    : result[firstNameLetter] = [friend];

  return result;
}, {});

const orderFriendGroupsAlphabetically = (groups) => Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));

const getFriendDivs = () => [].slice.call(document.getElementsByClassName(friendsContainerClasses));

const getAndCleanMasterDiv = () => {
  const masterDiv = document.getElementsByClassName(parentContainerClasses)[0];
  masterDiv.innerHTML = '';
  masterDiv.className = '';

  return masterDiv;
}

const createGroupContainer = (groupLetter, totalFriends) => {
  const groupContainer = document.createElement('div');
  groupContainer.className = 'collapsible';

  const title = document.createElement('h2');
  title.className = 'collapsible-header';
  title.innerHTML = `${groupLetter} (total: ${totalFriends})`;

  // Later we'll push all the friends whose name starts with the groupLetter
  // inside this div
  const friendsContainer = document.createElement('div');
  friendsContainer.className = 'container ' + parentContainerClasses;

  groupContainer.appendChild(title);
  groupContainer.appendChild(friendsContainer);

  return {
    groupContainer,
    friendsContainer,
  }
}

const addCollapseEventListener = (groupContainer) => {
  groupContainer.getElementsByClassName('collapsible-header')[0].addEventListener('click', event => {
    groupContainer.classList.contains('collapse')
      ?  groupContainer.classList.remove('collapse')
      :  groupContainer.classList.add('collapse');
  });
}

const main = async () => {
  await loadAllFriends();
  addCssClasses();
  const friends = getFriendDivs();
  const masterDiv = getAndCleanMasterDiv();

  const groupedFriends = groupFriendsByFirstLetter(friends);
  const orderedGroups = orderFriendGroupsAlphabetically(groupedFriends);

  orderedGroups.forEach(group => {
    const [groupLetter, friends] = group;
    const { groupContainer, friendsContainer } = createGroupContainer(groupLetter, friends.length);

    friends.forEach(f => friendsContainer.appendChild(f));
    masterDiv.appendChild(groupContainer);

    addCollapseEventListener(groupContainer);
  });
}

(async () => {
  await main();
})();
